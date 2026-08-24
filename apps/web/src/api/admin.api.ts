import { apiRequest } from './client';
import type { SystemRole } from '../types/api';
import type { PriorityLevel } from './cases.api';

export interface DepartmentDto{id:string;name:string;code:string;createdAt:string}
export interface JurisdictionDto{id:string;name:string;type:string;departmentId:string;createdAt:string;department:DepartmentDto}
export interface AssetDto{id:string;assetCode:string;name:string;assetType:'BRIDGE'|'ROAD'|'FLYOVER';departmentId:string;jurisdictionId:string;latitude:number|string|null;longitude:number|string|null;conditionStatus:string|null;createdAt:string;department:DepartmentDto;jurisdiction:JurisdictionDto}
export interface AdminUserDto{id:string;name:string;designation:string;employeeCode:string;email:string;role:SystemRole;status:string;departmentId:string;jurisdictionId:string;createdAt:string}
export interface AuthorityDto{id:string;userId:string;departmentId:string;jurisdictionId:string;canApprove:boolean;canReject:boolean;canRequestModification:boolean;canRequestReinspection:boolean;canEscalate:boolean;canCloseCase:boolean;maxPriorityLevel:PriorityLevel|null;isActive:boolean;validFrom:string|null;validUntil:string|null;createdAt:string;user:AdminUserDto;department:DepartmentDto;jurisdiction:JurisdictionDto}
export interface AssetInput{assetCode:string;name:string;assetType:'BRIDGE'|'ROAD'|'FLYOVER';departmentId:string;jurisdictionId:string;latitude?:number;longitude?:number;constructionYear?:number;conditionStatus?:string}
export interface UserInput{employeeCode:string;name:string;email:string;password:string;designation:string;role:SystemRole;departmentId:string;jurisdictionId:string}
export interface AuthorityInput{userId:string;departmentId:string;jurisdictionId:string;canApprove?:boolean;canReject?:boolean;canRequestModification?:boolean;canRequestReinspection?:boolean;canEscalate?:boolean;canCloseCase?:boolean;maxPriorityLevel?:PriorityLevel|null;validFrom?:string|null;validUntil?:string|null}
export interface AdminPage<T>{items:T[];nextCursor:string|null;limit:number;truncated?:boolean}

const get=<T>(path:string,token:string,signal?:AbortSignal)=>apiRequest<T>(path,{accessToken:token,signal});
const post=<T>(path:string,body:unknown,token:string,signal?:AbortSignal)=>apiRequest<T>(path,{method:'POST',body,accessToken:token,signal});
const normalize=<T>(value:AdminPage<T>|T[]):AdminPage<T>=>Array.isArray(value)?{items:value,nextCursor:null,limit:value.length}:value;
const page=<T>(path:string,token:string,signal?:AbortSignal)=>get<AdminPage<T>|T[]>(path,token,signal).then(normalize);
const queryPath=(path:string,query:string)=>`${path}${query?`?${query}`:''}`;

export const listDepartments=(token:string,signal?:AbortSignal)=>get<DepartmentDto[]>('/departments',token,signal);
export const createDepartment=(body:{name:string;code:string},token:string,signal?:AbortSignal)=>post<DepartmentDto>('/departments',body,token,signal);
export const listJurisdictions=(token:string,signal?:AbortSignal)=>get<JurisdictionDto[]>('/jurisdictions',token,signal);
export const createJurisdiction=(body:{name:string;type:string;departmentId:string},token:string,signal?:AbortSignal)=>post<JurisdictionDto>('/jurisdictions',body,token,signal);
export const getAssetsPage=(token:string,query='',signal?:AbortSignal)=>page<AssetDto>(queryPath('/assets',query),token,signal);
export const listAssets=(token:string,signal?:AbortSignal)=>getAssetsPage(token,'',signal).then(value=>value.items);
export const listMapAssets=(token:string,signal?:AbortSignal)=>getAssetsPage(token,'map=true',signal);
export const createAsset=(body:AssetInput,token:string,signal?:AbortSignal)=>post<AssetDto>('/assets',body,token,signal);
export const getUsersPage=(token:string,query='',signal?:AbortSignal)=>page<AdminUserDto>(queryPath('/users',query),token,signal);
export const listUsers=(token:string,signal?:AbortSignal)=>getUsersPage(token,'',signal).then(value=>value.items);
export const createUser=(body:UserInput,token:string,signal?:AbortSignal)=>post<AdminUserDto>('/users',body,token,signal);
export const getAuthoritiesPage=(token:string,query='',signal?:AbortSignal)=>page<AuthorityDto>(queryPath('/approval-authorities',query),token,signal);
export const listAuthorities=(token:string,signal?:AbortSignal)=>getAuthoritiesPage(token,'',signal).then(value=>value.items);
export const createAuthority=(body:AuthorityInput,token:string,signal?:AbortSignal)=>post<AuthorityDto>('/approval-authorities',body,token,signal);
