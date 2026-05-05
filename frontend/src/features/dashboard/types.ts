export interface DashboardData {
  summary: {
    total_all_incidents: number;
    total_handled_incidents: number;
    active_volunteers: number;
    countries_operated: number;
    regions: number;
  };
  all_time: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
    countries: Record<string, number>;
    handled_countries: Record<string, number>;
  };
  current_year: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
  };
  last_year: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
  };
  year_before_last: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
  };
  current_month: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
    countries: Record<string, number>;
    handled_countries: Record<string, number>;
  };
  last_month: {
    total_incidents: number;
    handled_incidents: number;
    incident_types: Record<string, number>;
    handled_incident_types: Record<string, number>;
    countries: Record<string, number>;
    handled_countries: Record<string, number>;
  };
  impact: {
    count_life_saved: number;
    count_life_threatening_incidents: number;
  };
}
