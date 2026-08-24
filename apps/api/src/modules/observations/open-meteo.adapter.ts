import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { RuntimeConfig } from '../../config/runtime';

export const OPEN_METEO_CONTRACT_VERSION = 'OPEN_METEO_CURRENT_V1';
export type WeatherTransport = (url: string, init: RequestInit) => Promise<Response>;
export type WeatherSleep = (milliseconds: number) => Promise<void>;
export class WeatherProviderError extends Error { constructor(public code: string, public status = 503) { super(code); } }

const schema = z.object({ latitude:z.number(), longitude:z.number(), timezone:z.literal('GMT'), current_units:z.object({time:z.literal('iso8601'),interval:z.literal('seconds'),temperature_2m:z.literal('°C'),precipitation:z.literal('mm'),wind_speed_10m:z.literal('km/h'),weather_code:z.literal('wmo code')}), current:z.object({time:z.string().min(1),interval:z.number().int().positive(),temperature_2m:z.number().min(-100).max(100),precipitation:z.number().nonnegative(),wind_speed_10m:z.number().nonnegative(),weather_code:z.number().int().min(0).max(99)}) }).passthrough();
const condition=(code:number)=>code===0?'CLEAR':code<=3?'CLOUDY':code<=48?'FOG':code<=67?'RAIN':code<=77?'SNOW':code<=82?'RAIN_SHOWERS':code<=86?'SNOW_SHOWERS':'THUNDERSTORM';
const defaultSleep:WeatherSleep=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const retryAfterMs=(value:string|null)=>{const seconds=Number(value);return value!==null&&Number.isFinite(seconds)&&seconds>=0?seconds*1000:null};

export class OpenMeteoAdapter {
 readonly providerId='OPEN_METEO'; readonly providerContractVersion=OPEN_METEO_CONTRACT_VERSION;
 constructor(private config:RuntimeConfig['weatherProvider'],private transport:WeatherTransport=fetch,private sleep:WeatherSleep=defaultSleep){}
 async fetchCurrent(request:{assetId:string;latitude:number;longitude:number}){
  if(!this.config.enabled)throw new WeatherProviderError('PROVIDER_DISABLED',409);
  if(!Number.isFinite(request.latitude)||request.latitude < -90||request.latitude > 90||!Number.isFinite(request.longitude)||request.longitude < -180||request.longitude > 180)throw new WeatherProviderError('TARGET_COORDINATES_INVALID',400);
  const url=new URL('/v1/forecast',this.config.baseUrl);url.searchParams.set('latitude',String(request.latitude));url.searchParams.set('longitude',String(request.longitude));url.searchParams.set('current','temperature_2m,precipitation,wind_speed_10m,weather_code');url.searchParams.set('temperature_unit','celsius');url.searchParams.set('wind_speed_unit','kmh');url.searchParams.set('precipitation_unit','mm');url.searchParams.set('timezone','GMT');
  let lastCode='PROVIDER_UNAVAILABLE';
  for(let attempt=0;attempt<=this.config.maxRetries;attempt++){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),this.config.timeoutMs);
   try{
    const response=await this.transport(url.toString(),{method:'GET',signal:controller.signal,headers:{Accept:'application/json'}});
    if(response.status===429){lastCode='PROVIDER_RATE_LIMITED';const delay=retryAfterMs(response.headers.get('Retry-After'));if(attempt<this.config.maxRetries&&delay!==null&&delay<=1000){await this.sleep(delay);continue}throw new WeatherProviderError(lastCode)}
    if(response.status>=500){lastCode='PROVIDER_UNAVAILABLE';if(attempt<this.config.maxRetries){await this.sleep(100*(attempt+1));continue}throw new WeatherProviderError(lastCode)}
    if(response.status===401||response.status===403)throw new WeatherProviderError('PROVIDER_AUTHENTICATION_FAILED');if(!response.ok)throw new WeatherProviderError('PROVIDER_REQUEST_REJECTED',502);
    let raw:unknown;try{raw=await response.json()}catch{throw new WeatherProviderError('PROVIDER_RESPONSE_INVALID',502)}const parsed=schema.safeParse(raw);if(!parsed.success)throw new WeatherProviderError('PROVIDER_RESPONSE_INVALID',502);
    const validAt=new Date(`${parsed.data.current.time}Z`);if(Number.isNaN(validAt.getTime()))throw new WeatherProviderError('PROVIDER_RESPONSE_INVALID',502);
    const identity=`${this.providerId}|${this.providerContractVersion}|${request.assetId}|${validAt.toISOString()}|CURRENT`;
    return{sourceRecordId:`open-meteo:${createHash('sha256').update(identity).digest('hex')}`,sourceVersion:this.providerContractVersion,schemaVersion:'ODYSSEY_WEATHER_V1',observedAt:validAt,normalizedData:{temperatureC:parsed.data.current.temperature_2m,rainfallMm:parsed.data.current.precipitation,windSpeedKph:parsed.data.current.wind_speed_10m,weatherCondition:condition(parsed.data.current.weather_code)},sourceMetadata:{providerId:this.providerId,adapterContractVersion:this.providerContractVersion,upstreamApi:'forecast/v1',dataSemantics:'CURRENT_MODEL_DERIVED',validAt:validAt.toISOString(),targetAssetId:request.assetId,targetCoordinates:{latitude:request.latitude,longitude:request.longitude},providerCoordinates:{latitude:parsed.data.latitude,longitude:parsed.data.longitude},intervalSeconds:parsed.data.current.interval,weatherCode:parsed.data.current.weather_code,timezone:parsed.data.timezone,units:{temperature:'°C',precipitation:'mm',windSpeed:'km/h'},deploymentClass:this.config.deploymentClass,attribution:'Weather data by Open-Meteo.com'}};
   }catch(error){if(error instanceof WeatherProviderError)throw error;lastCode=error instanceof DOMException&&error.name==='AbortError'?'PROVIDER_TIMEOUT':'PROVIDER_UNAVAILABLE';if(attempt<this.config.maxRetries){await this.sleep(100*(attempt+1));continue}throw new WeatherProviderError(lastCode)}finally{clearTimeout(timer)}
  }throw new WeatherProviderError(lastCode)
 }
}
