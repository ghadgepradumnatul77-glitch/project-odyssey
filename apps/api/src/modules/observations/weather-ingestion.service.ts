import prisma from '../../lib/prisma';
import { ExternalObservationType, SystemRole } from '../../generated/prisma';
import { getRuntimeConfig } from '../../config/runtime';
import { buildAssetReadWhere, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { ingestObservation, ObservationError } from './observation.service';
import { OpenMeteoAdapter, OPEN_METEO_CONTRACT_VERSION, WeatherProviderError } from './open-meteo.adapter';
import { metrics } from '../../operability/metrics';

export async function fetchAndIngestAssetWeather(assetId:string,principal:OrganizationalPrincipal,adapter=new OpenMeteoAdapter(getRuntimeConfig().weatherProvider)){
 if(principal.role!==SystemRole.OFFICER)throw new WeatherProviderError('WEATHER_FETCH_FORBIDDEN',403);
 const asset=await prisma.asset.findFirst({where:{id:assetId,AND:[buildAssetReadWhere(principal)]},select:{id:true,latitude:true,longitude:true,departmentId:true,jurisdictionId:true}});if(!asset)throw new WeatherProviderError('ASSET_NOT_FOUND',404);if(asset.latitude===null||asset.longitude===null)throw new WeatherProviderError('TARGET_COORDINATES_MISSING',409);
 const config=getRuntimeConfig().weatherProvider;const source=await prisma.observationSource.findFirst({where:{sourceCode:config.sourceCode,sourceType:'WEATHER_PROVIDER',contractVersion:OPEN_METEO_CONTRACT_VERSION,isActive:true,AND:[{OR:[{departmentId:null},{departmentId:asset.departmentId,jurisdictionId:null},{departmentId:asset.departmentId,jurisdictionId:asset.jurisdictionId}]}]},orderBy:{versionNumber:'desc'}});if(!source)throw new ObservationError('COMPATIBLE_ACTIVE_WEATHER_SOURCE_NOT_FOUND',409);if(source.providerReference!=='OPEN_METEO')throw new ObservationError('WEATHER_SOURCE_PROVIDER_MISMATCH',409);
 let weather;try{weather=await adapter.fetchCurrent({assetId:asset.id,latitude:Number(asset.latitude),longitude:Number(asset.longitude)});metrics.recordWeather('success')}catch(error){if(error instanceof WeatherProviderError)metrics.recordWeather(error.code==='PROVIDER_TIMEOUT'?'timeout':error.code==='PROVIDER_RATE_LIMITED'?'rate_limited':error.code==='PROVIDER_RESPONSE_INVALID'?'invalid_response':'failure');else metrics.recordWeather('failure');throw error}return ingestObservation({...weather,sourceId:source.id,observationType:ExternalObservationType.WEATHER,assetId:asset.id},principal);
}
