export type GramRole = 'central' | 'head' | 'worker' | 'patient';

export const roleLabels: Record<GramRole, string> = { central: 'Central Authority', head: 'Area / PHC Head', worker: 'PHC Worker', patient: 'Patient' };

export type GramPatient = { id: string; name: string; age: number; gender: string; village: string; contact: string; bloodGroup: string; phc: string; conditions: string[]; allergies: string[]; maternal?: boolean; registered: string; indicators: string[] };
export const patients: GramPatient[] = [
  { id:'GS-2401', name:'Ramesh Patel', age:58, gender:'Male', village:'Rampur', contact:'•••• 2841', bloodGroup:'B+', phc:'Rampur PHC', conditions:['Hypertension'], allergies:['None known'], registered:'12 Sep 2026', indicators:['Blood pressure monitoring suggested'] },
  { id:'GS-2402', name:'Meena Shah', age:31, gender:'Female', village:'Kheda', contact:'•••• 1057', bloodGroup:'O+', phc:'Kheda PHC', conditions:['Iron deficiency'], allergies:['Penicillin'], maternal:true, registered:'11 Sep 2026', indicators:['Nutrition and Hb review suggested'] },
  { id:'GS-2403', name:'Kavita Parmar', age:26, gender:'Female', village:'Sankheda', contact:'•••• 6934', bloodGroup:'A+', phc:'Rampur PHC', conditions:['No ongoing condition'], allergies:['None known'], registered:'09 Sep 2026', indicators:['Routine wellness record'] },
  { id:'GS-2404', name:'Arjun Solanki', age:9, gender:'Male', village:'Kheda', contact:'•••• 8820', bloodGroup:'O-', phc:'Kheda PHC', conditions:['Seasonal asthma'], allergies:['Dust'], registered:'08 Sep 2026', indicators:['Inhaler use review suggested'] },
  { id:'GS-2405', name:'Pooja Rathod', age:28, gender:'Female', village:'Bhadarva', contact:'•••• 4429', bloodGroup:'AB+', phc:'Bhadarva PHC', conditions:['Pregnancy — 24 weeks'], allergies:['None known'], maternal:true, registered:'06 Sep 2026', indicators:['ANC checkup and nutrition guidance'] },
  { id:'GS-2406', name:'Mahesh Thakor', age:64, gender:'Male', village:'Rampur', contact:'•••• 7190', bloodGroup:'A+', phc:'Rampur PHC', conditions:['Type 2 diabetes'], allergies:['None known'], registered:'03 Sep 2026', indicators:['Blood sugar monitoring suggested'] },
];

export const camps = [
  ['Maternal Wellness Camp','Rampur Community Hall','21 Sep 2026','Scheduled'],
  ['Nutrition & Anaemia Drive','Kheda Anganwadi','24 Sep 2026','Approved'],
  ['Monsoon Hygiene Awareness','Bhadarva School','29 Sep 2026','Requested'],
];
export const outbreaks = [
  ['Seasonal fever increase','Rampur PHC','18 approximate cases','Under Review'],
  ['Water-borne illness reports','Kheda PHC','9 approximate cases','Support Requested'],
];
export const resourceRequests = [
  ['Medical kits','40','Rampur PHC','Approved'],
  ['Iron & folic acid tablets','600','Kheda PHC','Dispatched'],
  ['ANM support','2 workers','Bhadarva PHC','Requested'],
];
