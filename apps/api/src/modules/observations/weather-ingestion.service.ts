import prisma from '../../lib/prisma';
import { ExternalObservationType, SystemRole } from '../../generated/prisma';
import { getRuntimeConfig } from '../../config/runtime';
import { buildAssetReadWhere, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { ingestObservation, ObservationError } from './observation.service';
import { OpenMeteoAdapter, OPEN_METEO_CONTRACT_VERSION, WeatherProviderError } from './open-meteo.adapter';

export async function fetchAndIngestAssetWeather(assetId:string,principal:OrganizationalPrincipal,adapter=new OpenMeteoAdapter(getRuntimeConfig().weatherProvider)){
 if(principal.role!==SystemRole.OFFICER)throw new WeatherProviderError('WEATHER_FETCH_FORBIDDEN',403);
 const asset=await prisma.asset.findFirst({where:{id:assetId,AND:[buildAssetReadWhere(principal)]},select:{id:true,latitude:true,longitude:true,departmentId:true,jurisdictionId:true}});if(!asset)throw new WeatherProviderError('ASSET_NOT_FOUND',404);if(asset.latitude===null||asset.longitude===null)throw new WeatherProviderError('TARGET_COORDINATES_MISSING',409);
 const config=getRuntimeConfig().weatherProvider;const source=await prisma.observationSource.findFirst({where:{sourceCode:config.sourceCode,sourceType:'WEATHER_PROVIDER',contractVersion:OPEN_METEO_CONTRACT_VERSION,isActive:true,AND:[{OR:[{departmentId:null},{departmentId:asset.departmentId,jurisdictionId:null},{departmentId:asset.departmentId,jurisdictionId:asset.jurisdictionId}]}]},orderBy:{versionNumber:'desc'}});if(!source)throw new ObservationError('COMPATIBLE_ACTIVE_WEATHER_SOURCE_NOT_FOUND',409);if(source.providerReference!=='OPEN_METEO')throw new ObservationError('WEATHER_SOURCE_PROVIDER_MISMATCH',409);
 const weather=await adapter.fetchCurrent({assetId:asset.id,latitude:Number(asset.latitude),longitude:Number(asset.longitude)});return ingestObservation({...weather,sourceId:source.id,observationType:ExternalObservationType.WEATHER,assetId:asset.id},principal);
}
