import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { divIcon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listMapPublicReports, type PublicReportSummary, type PublicReportStatus } from '../api/public-reports.api';
import { listMapCases, type CaseStatus, type CaseSummary, type PriorityLevel } from '../api/cases.api';
import { listMapAssets, type AssetDto } from '../api/admin.api';
import { useAuth } from '../auth/useAuth';
import { Empty, ErrorState, Loading } from '../components/AsyncState';

type Layer = 'reports' | 'cases' | 'assets';
type Selected = { kind: 'report'; item: PublicReportSummary } | { kind: 'case'; item: CaseSummary } | { kind: 'asset'; item: AssetDto };
const reportStatuses: PublicReportStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
const priorities: PriorityLevel[] = ['CRITICAL', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'];
const caseStatuses: CaseStatus[] = ['NEW', 'INSPECTION_REQUIRED', 'INSPECTION_IN_PROGRESS', 'UNDER_ANALYSIS', 'ORP_READY', 'UNDER_REVIEW', 'APPROVED', 'EXECUTION', 'VERIFICATION', 'CLOSED'];
const categoryLabel = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const coordinate = (value: number | string | null | undefined) => { const parsed = typeof value === 'string' && value.trim() ? Number(value) : value; return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null; };
const positionOf = (value: { latitude?: number | string | null; longitude?: number | string | null }): [number,number] | null => { const latitude=coordinate(value.latitude),longitude=coordinate(value.longitude); return latitude !== null && latitude >= -90 && latitude <= 90 && longitude !== null && longitude >= -180 && longitude <= 180 ? [latitude,longitude] : null; };
const hasCoordinates = (value: { latitude?: number | string | null; longitude?: number | string | null }) => positionOf(value) !== null;
const markerIcon = (kind: 'case' | 'asset', tone = '') => divIcon({
  className: `intelligence-marker ${kind} ${tone.toLowerCase().replaceAll('_','-')}`,
  html: `<span aria-hidden="true"></span>`, iconSize: [28, 28], iconAnchor: [14, 14]
});
const reportMarkerColors:Record<PublicReportStatus,{color:string;fillColor:string}>={SUBMITTED:{color:'#24618b',fillColor:'#e4f0f7'},UNDER_REVIEW:{color:'#8a6719',fillColor:'#fbf3d8'},ACCEPTED:{color:'#2f7158',fillColor:'#e4f4ec'},REJECTED:{color:'#8b4c48',fillColor:'#f4e9e8'}};

export default function InfrastructureMapPage({ onOpenReport, onOpenCase }: { onOpenReport(id: string): void; onOpenCase(id: string): void }) {
  const { token } = useAuth();
  const [reports, setReports] = useState<PublicReportSummary[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [truncatedLayers, setTruncatedLayers] = useState<Layer[]>([]);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ reports: true, cases: true, assets: true });
  const [reportStatus, setReportStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [selected, setSelected] = useState<Selected | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true); setError(null);
    Promise.all([listMapPublicReports(token, controller.signal), listMapCases(token, controller.signal), listMapAssets(token, controller.signal)])
      .then(([reportPage, casePage, assetPage]) => {
        setReports(reportPage.items); setCases(casePage.items); setAssets(assetPage.items);
        setTruncatedLayers([
          ...(reportPage.truncated ? ['reports' as const] : []),
          ...(casePage.truncated ? ['cases' as const] : []),
          ...(assetPage.truncated ? ['assets' as const] : [])
        ]);
      })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload, token]);

  const visibleReports = useMemo(() => reports.filter((item) => layers.reports && hasCoordinates(item) && (!reportStatus || item.status === reportStatus) && (!jurisdiction || item.jurisdiction?.id === jurisdiction)), [jurisdiction, layers.reports, reportStatus, reports]);
  const visibleCases = useMemo(() => cases.filter((item) => layers.cases && hasCoordinates(item.asset) && (!priority || item.priorityLevel === priority) && (!caseStatus || item.status === caseStatus) && (!jurisdiction || item.asset.jurisdiction.id === jurisdiction)), [caseStatus, cases, jurisdiction, layers.cases, priority]);
  const visibleAssets = useMemo(() => assets.filter((item) => layers.assets && hasCoordinates(item) && (!jurisdiction || item.jurisdiction.id === jurisdiction)), [assets, jurisdiction, layers.assets]);
  const jurisdictions = useMemo(() => [...new Map([...assets.map((item) => item.jurisdiction), ...cases.map((item) => item.asset.jurisdiction)].map((item) => [item.id, item])).values()], [assets, cases]);
  const positions = [...visibleReports.map((item) => positionOf(item)! as LatLngExpression), ...visibleCases.map((item) => positionOf(item.asset)! as LatLngExpression), ...visibleAssets.map((item) => positionOf(item)! as LatLngExpression)];
  const center = positions[0] ?? [18.5204, 73.8567];
  const mappedCount = reports.filter(hasCoordinates).length + cases.filter((item) => hasCoordinates(item.asset)).length + assets.filter(hasCoordinates).length;
  const unmappedCount = reports.length + cases.length + assets.length - mappedCount;
  const assetCaseCounts = useMemo(() => new Map(assets.map((asset) => [asset.id, cases.filter((item) => item.asset.id === asset.id).length])), [assets, cases]);

  if (loading) return <Loading label="map intelligence" />;
  if (error) return <ErrorState error={error} retry={() => setReload((value) => value + 1)} />;
  return <section className="intelligence-page" aria-labelledby="intelligence-heading">
    <header className="intelligence-header"><div><p className="eyebrow">INFRASTRUCTURE INTELLIGENCE</p><h1 id="intelligence-heading">Pune Division Situation Map</h1><p className="summary">Citizen signals, infrastructure assets and governed cases across the authorized operational scope.</p></div>
      <dl className="intelligence-summary"><Metric label="Public Reports" value={reports.length}/><Metric label="Governed Cases" value={cases.length}/><Metric label="Critical Cases" value={cases.filter((item) => item.priorityLevel === 'CRITICAL').length}/><Metric label="Emergency Cases" value={cases.filter((item) => item.emergencyFlag).length}/></dl>
    </header>
    <div className="demo-map-note">Demo environment — locations shown are representative test coordinates.</div>
    {truncatedLayers.length > 0 && <div className="map-data-notice" role="status"><strong>Bounded map view</strong><p>Showing the first 250 authorized records for: {truncatedLayers.map(categoryLabel).join(', ')}. This map is not a complete count for those layers.</p></div>}
    {unmappedCount > 0 && <div className="map-data-notice" role="status"><strong>Map-ready location coverage</strong><p>Some records are not shown because map coordinates are unavailable.</p><span>{mappedCount} mapped · {unmappedCount} unmapped</span></div>}
    <div className="intelligence-controls" aria-label="Infrastructure map filters">
      <fieldset><legend>Layers</legend>{(['reports','cases','assets'] as Layer[]).map((layer) => <label key={layer}><input type="checkbox" checked={layers[layer]} onChange={() => setLayers((value) => ({ ...value, [layer]: !value[layer] }))}/>{layer === 'reports' ? 'Public Reports' : categoryLabel(layer)}</label>)}</fieldset>
      <Filter label="Public Report status" value={reportStatus} onChange={setReportStatus} values={reportStatuses}/>
      <Filter label="Case priority" value={priority} onChange={setPriority} values={priorities}/>
      <Filter label="Case status" value={caseStatus} onChange={setCaseStatus} values={caseStatuses}/>
      {jurisdictions.length > 1 && <Filter label="Jurisdiction" value={jurisdiction} onChange={setJurisdiction} values={jurisdictions.map((item) => item.id)} labels={jurisdictions.map((item) => item.name)}/>} 
    </div>
    <div className="map-legend" aria-label="Map legend"><span className="legend-report">Public Report · unverified signal</span><span className="legend-case">Governed Case · authoritative assessment</span><span className="legend-asset">Infrastructure Asset</span></div>
    <div className="intelligence-layout">
      <div className="map-frame" aria-label="Infrastructure intelligence map">
        {!positions.length ? <Empty>No map-ready records match the selected layers and filters.</Empty> : <MapContainer key={`${center}`} center={center} zoom={13} scrollWheelZoom className="leaflet-intelligence-map">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {visibleReports.map((item) => <CircleMarker key={`report-${item.id}`} center={positionOf(item)!} radius={10} pathOptions={{ ...reportMarkerColors[item.status], fillOpacity: .95, weight: 3 }} eventHandlers={{ click: () => setSelected({kind:'report',item}) }}><Tooltip>{item.reportNumber} · Public Report · {categoryLabel(item.status)}</Tooltip></CircleMarker>)}
          {visibleAssets.map((item) => <Marker key={`asset-${item.id}`} position={positionOf(item)!} icon={markerIcon('asset')} eventHandlers={{ click: () => setSelected({kind:'asset',item}) }}><Tooltip>{item.assetCode} · Infrastructure Asset</Tooltip></Marker>)}
          {visibleCases.map((item) => <Marker key={`case-${item.id}`} position={positionOf(item.asset)!} icon={markerIcon('case',item.riskLevel ?? 'not-assessed')} eventHandlers={{ click: () => setSelected({kind:'case',item}) }}><Tooltip>{item.caseNumber} · Governed Case · {item.riskLevel ? `Authoritative risk ${categoryLabel(item.riskLevel)}` : 'Risk not assessed'}</Tooltip></Marker>)}
        </MapContainer>}
      </div>
      <aside className="intelligence-detail" aria-live="polite">{selected ? <RecordDetail selected={selected} caseCount={selected.kind === 'asset' ? assetCaseCounts.get(selected.item.id) ?? 0 : 0} onOpenReport={onOpenReport} onOpenCase={onOpenCase}/> : <><p className="eyebrow">RECORD DETAILS</p><h2>Select a mapped record</h2><p>Choose a marker or use the accessible record list below.</p></>}</aside>
    </div>
    <section className="map-result-list" aria-labelledby="mapped-records-heading"><div><p className="eyebrow">ACCESSIBLE MAP RESULTS</p><h2 id="mapped-records-heading">Currently mapped records</h2></div>
      {!positions.length ? <p>No records match the selected map filters.</p> : <div className="mapped-record-grid">
        {visibleReports.map((item) => <RecordButton key={`list-report-${item.id}`} label="Public Report" title={item.reportNumber} detail={item.title} onClick={() => setSelected({kind:'report',item})}/>) }
        {visibleCases.map((item) => <RecordButton key={`list-case-${item.id}`} label="Governed Case" title={item.caseNumber} detail={item.title} onClick={() => setSelected({kind:'case',item})}/>) }
        {visibleAssets.map((item) => <RecordButton key={`list-asset-${item.id}`} label="Infrastructure Asset" title={item.assetCode} detail={item.name} onClick={() => setSelected({kind:'asset',item})}/>) }
      </div>}
    </section>
  </section>;
}

function RecordDetail({ selected, caseCount, onOpenReport, onOpenCase }: { selected: Selected; caseCount: number; onOpenReport(id:string):void; onOpenCase(id:string):void }) {
  if (selected.kind === 'report') { const item = selected.item; return <><p className="eyebrow">PUBLIC REPORT · UNVERIFIED SIGNAL</p><h2>{item.reportNumber}</h2><p>{item.title}</p><Facts values={[['Category',categoryLabel(item.category)],['Location',item.locationText],['Status',categoryLabel(item.status)],['Submitted',new Date(item.submittedAt).toLocaleString('en-IN')],['Department',item.department?.name ?? 'Not assigned'],['Jurisdiction',item.jurisdiction?.name ?? 'Not assigned'],['Linked asset',item.asset ? `${item.asset.name} · ${item.asset.assetCode}` : 'Not linked']]}/>{item.triageAnalysis && <div className="advisory-map-result"><strong>Advisory urgency · {categoryLabel(item.triageAnalysis.urgencyLevel)}</strong><span>Suggested category: {categoryLabel(item.triageAnalysis.suggestedCategory)} · Confidence {item.triageAnalysis.confidence}%</span><small>{item.triageAnalysis.reasons[0]?.message}</small></div>}{item.createdCase && <div className="map-provenance"><strong>Governed Case Created</strong><span>{item.createdCase.caseNumber}</span><button className="secondary-button" onClick={() => onOpenCase(item.createdCase!.id)}>Open governed case</button></div>}<button className="primary-button" onClick={() => onOpenReport(item.id)}>Open Public Report</button></>; }
  if (selected.kind === 'case') { const item = selected.item; return <><p className="eyebrow">GOVERNED CASE · AUTHORITATIVE RECORD</p><h2>{item.caseNumber}</h2><p>{item.title}</p><Facts values={[['Asset',`${item.asset.name} · ${item.asset.assetCode}`],['Status',categoryLabel(item.status)],['Authoritative risk',item.riskLevel ? categoryLabel(item.riskLevel) : 'Not assessed'],['Authoritative priority',item.priorityLevel ? categoryLabel(item.priorityLevel) : 'Not assessed'],['Emergency',item.emergencyFlag ? 'Yes' : 'No'],['Department',item.asset.department.name],['Jurisdiction',item.asset.jurisdiction.name]]}/><button className="primary-button" onClick={() => onOpenCase(item.id)}>Open governed case</button></>; }
  const item = selected.item; return <><p className="eyebrow">INFRASTRUCTURE ASSET</p><h2>{item.assetCode}</h2><p>{item.name}</p><Facts values={[['Type',categoryLabel(item.assetType)],['Department',item.department.name],['Jurisdiction',item.jurisdiction.name],['Governed Cases',String(caseCount)]]}/></>;
}
function Facts({values}:{values:[string,string][]}) { return <dl className="map-detail-facts">{values.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>; }
function Metric({label,value}:{label:string;value:number}) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Filter({label,value,onChange,values,labels}:{label:string;value:string;onChange(value:string):void;values:string[];labels?:string[]}) { const id=`map-${label.toLowerCase().replace(/[^a-z]+/g,'-')}`; return <label htmlFor={id}>{label}<select id={id} value={value} onChange={(event)=>onChange(event.target.value)}><option value="">All</option>{values.map((entry,index)=><option key={entry} value={entry}>{labels?.[index] ?? categoryLabel(entry)}</option>)}</select></label>; }
function RecordButton({label,title,detail,onClick}:{label:string;title:string;detail:string;onClick():void}) { return <button type="button" onClick={onClick} aria-label={`Select ${label} ${title}`}><small>{label}</small><strong>{title}</strong><span>{detail}</span></button>; }
