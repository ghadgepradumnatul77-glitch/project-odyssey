import type { NextFunction,Request,Response } from 'express';
import { randomUUID } from 'node:crypto';
import { getRuntimeConfig } from '../config/runtime';
import { metrics } from './metrics';

export type LogLevel='info'|'warn'|'error'|'fatal';
export type LogSink=(line:string)=>void;
const sensitiveKey=/(authorization|cookie|password|secret|token|databaseurl|apikey|trackingreference|reporter|email|phone|contact|evidence|narrative)/i;
const redactString=(value:string)=>value.replace(/Bearer\s+[A-Za-z0-9._~-]+/gi,'[REDACTED]').replace(/postgres(?:ql)?:\/\/[^\s]+/gi,'[REDACTED]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[REDACTED]');
export function redact(value:unknown,key=''):unknown{if(sensitiveKey.test(key))return'[REDACTED]';if(typeof value==='string')return redactString(value);if(Array.isArray(value))return value.map(item=>redact(item));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,redact(v,k)]));return value}
export function structuredLog(level:LogLevel,event:string,fields:Record<string,unknown>={},sink?:LogSink){const config=getRuntimeConfig();const record=redact({timestamp:new Date().toISOString(),level,event,service:'odyssey-api',environment:config.environment,...fields});const line=JSON.stringify(record);(sink??(level==='error'||level==='fatal'?console.error:console.log))(line);return line}
export const requestId=(request:Request)=>String((request as Request&{requestId?:string}).requestId??'');
export const normalizedOperationalRoute=(path:string)=>path.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi,':id').replace(/\/\d+(?=\/|$)/g,'/:id');
export function requestObservability(sink?:LogSink){return(req:Request,res:Response,next:NextFunction)=>{const id=randomUUID();(req as Request&{requestId:string}).requestId=id;res.setHeader('X-Request-Id',id);const started=performance.now();res.once('finish',()=>{const durationMs=Math.max(0,Math.round((performance.now()-started)*100)/100),route=normalizedOperationalRoute(req.originalUrl.split('?')[0]),statusCode=res.statusCode;metrics.recordRequest(statusCode,durationMs);structuredLog(statusCode>=500?'error':statusCode>=400?'warn':'info','HTTP_REQUEST_COMPLETED',{requestId:id,method:req.method,route,statusCode,durationMs,errorCategory:statusCode>=500?'INTERNAL':statusCode===401?'AUTHENTICATION':statusCode===403?'AUTHORIZATION':statusCode>=400?'VALIDATION':undefined},sink)});next()}}
