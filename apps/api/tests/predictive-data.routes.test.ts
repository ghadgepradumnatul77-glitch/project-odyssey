import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';
const mocks=vi.hoisted(()=>({user:vi.fn(),readiness:vi.fn(),dataset:vi.fn(),voidSnapshot:vi.fn(),voidOutcome:vi.fn()}));
vi.mock('../src/lib/prisma',()=>({default:{user:{findUnique:mocks.user}}}));
vi.mock('../src/modules/predictive-data/predictive-data.service',()=>({PredictiveDataError:class PredictiveDataError extends Error{constructor(public code:string,public status:number,message:string){super(message)}},getPredictiveReadiness:mocks.readiness,getTaskLatenessDataset:mocks.dataset,voidSnapshot:mocks.voidSnapshot,voidOutcome:mocks.voidOutcome}));
import routes from '../src/modules/predictive-data/predictive-data.routes';
const app=express();app.use(express.json());app.use('/api/v1',routes);const id='10000000-0000-4000-8000-000000000001';
async function auth(role:string){const user={id:`u-${role}`,role,status:'ACTIVE',departmentId:'dep',jurisdictionId:'jur'};mocks.user.mockResolvedValue(user);const config=getAuthConfig();return `Bearer ${await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`}
beforeEach(()=>{vi.clearAllMocks();mocks.readiness.mockResolvedValue({modelStatus:'NO_MODEL_YET'});mocks.dataset.mockResolvedValue({items:[]});mocks.voidSnapshot.mockResolvedValue({id,status:'VOID'});mocks.voidOutcome.mockResolvedValue({id,status:'VOID'})});
describe('predictive data routes',()=>{
 it('requires authentication and limits reads to auditors and system administrators',async()=>{await request(app).get('/api/v1/predictive-data/readiness').expect(401);for(const role of ['OFFICER','POLICY_ADMIN'])await request(app).get('/api/v1/predictive-data/readiness').set('Authorization',await auth(role)).expect(403);for(const role of ['AUDITOR','SYSTEM_ADMIN'])await request(app).get('/api/v1/predictive-data/readiness').set('Authorization',await auth(role)).expect(200)});
 it('binds organizational principal to the scoped dataset service',async()=>{await request(app).get('/api/v1/predictive-data/datasets/task-lateness?limit=10').set('Authorization',await auth('AUDITOR')).expect(200);expect(mocks.dataset).toHaveBeenCalledWith(expect.objectContaining({departmentId:'dep',jurisdictionId:'jur'}),{limit:10,offset:0,includeDemo:false})});
 it('reserves void operations for system administrators and validates reasons',async()=>{await request(app).post(`/api/v1/predictive-data/snapshots/${id}/void`).set('Authorization',await auth('AUDITOR')).send({reason:'invalid source'}).expect(403);await request(app).post(`/api/v1/predictive-data/snapshots/${id}/void`).set('Authorization',await auth('SYSTEM_ADMIN')).send({reason:'x'}).expect(400);await request(app).post(`/api/v1/predictive-data/outcomes/${id}/void`).set('Authorization',await auth('SYSTEM_ADMIN')).send({reason:'superseded evidence'}).expect(200);expect(mocks.voidOutcome).toHaveBeenCalledWith(id,'superseded evidence',undefined,expect.objectContaining({id:'u-SYSTEM_ADMIN'}))});
});
