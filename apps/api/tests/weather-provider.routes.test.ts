import express from 'express';import request from 'supertest';import { SignJWT } from 'jose';import { beforeEach,describe,expect,it,vi } from 'vitest';import { getAuthConfig } from '../src/config/auth';
const mocks=vi.hoisted(()=>({user:vi.fn(),weather:vi.fn()}));
vi.mock('../src/lib/prisma',()=>({default:{user:{findUnique:mocks.user}}}));
vi.mock('../src/modules/observations/weather-ingestion.service',()=>({fetchAndIngestAssetWeather:mocks.weather}));
import routes from '../src/modules/observations/observation.routes';
const app=express();app.use(express.json());app.use('/api/v1',routes);const asset='40000000-0000-4000-8000-000000000001';
async function auth(role='OFFICER'){const user={id:`u-${role}`,role,status:'ACTIVE',departmentId:'d',jurisdictionId:'j'};mocks.user.mockResolvedValue(user);const config=getAuthConfig();return`Bearer ${await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`}
beforeEach(()=>{vi.clearAllMocks();mocks.weather.mockResolvedValue({created:true,observation:{id:'weather'}})});
describe('governed provider route',()=>{
 it('permits scoped OFFICER invocation and returns replay semantics',async()=>{const response=await request(app).post(`/api/v1/assets/${asset}/external-observations/weather/fetch`).set('Authorization',await auth()).send().expect(201);expect(response.body.data.idempotentReplay).toBe(false);expect(mocks.weather).toHaveBeenCalledWith(asset,expect.objectContaining({role:'OFFICER'}))});
 it('rejects anonymous and non-operational roles',async()=>{await request(app).post(`/api/v1/assets/${asset}/external-observations/weather/fetch`).expect(401);for(const role of['AUDITOR','POLICY_ADMIN','SYSTEM_ADMIN'])await request(app).post(`/api/v1/assets/${asset}/external-observations/weather/fetch`).set('Authorization',await auth(role)).expect(403);expect(mocks.weather).not.toHaveBeenCalled()});
 it('rejects client coordinates, source IDs, and URL overrides',async()=>{await request(app).post(`/api/v1/assets/${asset}/external-observations/weather/fetch`).set('Authorization',await auth()).send({latitude:1,longitude:2,sourceId:'forged',url:'http://localhost'}).expect(400);expect(mocks.weather).not.toHaveBeenCalled()});
});
