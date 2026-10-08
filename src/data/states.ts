/** The 50 states and the District of Columbia: slug (URL segment), name, postal abbreviation. */
export interface StateRef { slug: string; name: string; abbr: string }
export const STATE_LIST: StateRef[] = [
  ['alabama', 'Alabama', 'AL'], ['alaska', 'Alaska', 'AK'], ['arizona', 'Arizona', 'AZ'], ['arkansas', 'Arkansas', 'AR'],
  ['california', 'California', 'CA'], ['colorado', 'Colorado', 'CO'], ['connecticut', 'Connecticut', 'CT'], ['delaware', 'Delaware', 'DE'],
  ['district-of-columbia', 'District of Columbia', 'DC'], ['florida', 'Florida', 'FL'], ['georgia', 'Georgia', 'GA'], ['hawaii', 'Hawaii', 'HI'],
  ['idaho', 'Idaho', 'ID'], ['illinois', 'Illinois', 'IL'], ['indiana', 'Indiana', 'IN'], ['iowa', 'Iowa', 'IA'],
  ['kansas', 'Kansas', 'KS'], ['kentucky', 'Kentucky', 'KY'], ['louisiana', 'Louisiana', 'LA'], ['maine', 'Maine', 'ME'],
  ['maryland', 'Maryland', 'MD'], ['massachusetts', 'Massachusetts', 'MA'], ['michigan', 'Michigan', 'MI'], ['minnesota', 'Minnesota', 'MN'],
  ['mississippi', 'Mississippi', 'MS'], ['missouri', 'Missouri', 'MO'], ['montana', 'Montana', 'MT'], ['nebraska', 'Nebraska', 'NE'],
  ['nevada', 'Nevada', 'NV'], ['new-hampshire', 'New Hampshire', 'NH'], ['new-jersey', 'New Jersey', 'NJ'], ['new-mexico', 'New Mexico', 'NM'],
  ['new-york', 'New York', 'NY'], ['north-carolina', 'North Carolina', 'NC'], ['north-dakota', 'North Dakota', 'ND'], ['ohio', 'Ohio', 'OH'],
  ['oklahoma', 'Oklahoma', 'OK'], ['oregon', 'Oregon', 'OR'], ['pennsylvania', 'Pennsylvania', 'PA'], ['rhode-island', 'Rhode Island', 'RI'],
  ['south-carolina', 'South Carolina', 'SC'], ['south-dakota', 'South Dakota', 'SD'], ['tennessee', 'Tennessee', 'TN'], ['texas', 'Texas', 'TX'],
  ['utah', 'Utah', 'UT'], ['vermont', 'Vermont', 'VT'], ['virginia', 'Virginia', 'VA'], ['washington', 'Washington', 'WA'],
  ['west-virginia', 'West Virginia', 'WV'], ['wisconsin', 'Wisconsin', 'WI'], ['wyoming', 'Wyoming', 'WY'],
].map(([slug, name, abbr]) => ({ slug, name, abbr }));
export const stateRef = (slug: string): StateRef => {
  const s = STATE_LIST.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown state slug: ${slug}`);
  return s;
};
