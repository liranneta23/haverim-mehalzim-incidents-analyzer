# Incidents Analyzer - Backend API & Frontend Dashboard

A professional web application that displays comprehensive incident data from Monday.com through a Flask API backend and a responsive, feature-rich web dashboard.

## Project Structure

```
├── main.py              # Flask API backend with all data processing functions
├── constants.py         # Configuration constants
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Features

- **Professional Flask API Backend** with comprehensive RESTful endpoints
- **Real-time Dashboard** with complete incident analytics
- **Comprehensive Data Display**:
  - Total incidents and breakdown by type
  - Handled vs. unhandled incidents
  - Geographic distribution (countries)
  - Impact metrics (lives saved, life-threatening incidents)
  - Current month statistics
  - All-time statistics
- **Responsive Design** with Hebrew (RTL) support
- **Auto-refresh** data every 5 minutes
- **CORS-enabled** for cross-origin requests
- **Two-column layout** for better data comparison

## Features

### Data Tracked

**All Statistics Include:**
- Total incident count and breakdown by type
- Medical, Mental health, Search, Rescue, Antisemitism, Rescue teams, Other
- Geographic distribution (countries operated in)
- All-time data vs. current month data
- Handled incidents vs. all incidents
- Impact metrics: Life-threatening incidents, Lives saved

## Setup & Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Make sure your `.env` file contains:
```
MONDAY_API_KEY=your_monday_api_key_here
```

### 3. Run the Application

```bash
python main.py
```

The application will start on `http://localhost:5000`

## API Endpoints

### 1. Home Page (Dashboard)
```
GET /
```
Returns the main dashboard HTML page with all data visualization.

### 2. Comprehensive Dashboard Data
```
GET /api/dashboard
```
Returns all dashboard data including summary, all-time data, current month data, and impact metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_all_incidents": 45,
      "total_handled_incidents": 30,
      "active_volunteers": 30,
      "countries_operated": 8,
      "regions": 6
    },
    "all_time": {
      "total_incidents": 45,
      "handled_incidents": 30,
      "incident_types": {
        "רפואי": 15,
        "נפשי": 8,
        "איתור": 5
      },
      "handled_incident_types": {...},
      "countries": {
        "Israel": 30,
        "Jordan": 10,
        "Egypt": 5
      },
      "handled_countries": {...}
    },
    "current_month": {
      "total_incidents": 8,
      "handled_incidents": 6,
      "incident_types": {...},
      "handled_incident_types": {...},
      "countries": {...},
      "handled_countries": {...}
    },
    "impact": {
      "count_life_saved": 12,
      "count_life_threatening_incidents": 8
    }
  }
}
```

### 3. Get All Incidents
```
GET /api/incidents
```
Returns all incidents from Monday.com board with full details.

### 4. Get Incident Summary
```
GET /api/incidents/summary
```
Returns incident type counts and basic statistics.

### 5. Health Check
```
GET /api/health
```
Returns API health status.

## Dashboard Sections

### 1. General Summary
- Total incidents
- Handled incidents (filtered)
- Active volunteers
- Countries operated in

### 2. Impact Metrics
- Life-threatening incidents count
- Lives saved count

### 3. All-Time Statistics
- Incident types breakdown (all incidents)
- Incident types breakdown (handled incidents)
- Geographic distribution (all incidents)
- Geographic distribution (handled incidents)

### 4. Current Month Statistics
- Month's incident count
- Month's handled incidents count
- Incident types breakdown for the month
- Geographic distribution for the month

## Data Filtering

The application automatically filters incidents based on:
- `status_mkmb1zc6` - Incident type column
- `country_mkmb91h3` - Country column
- `timeline_mkmbcabh` - Date range column (for current month filtering)
- `color_mkvvrm1r` - Incident status (Opened, Handled by Ron, Significant)
- `check_mkn3c7v8` - Life-threatening flag

## Technology Stack

- **Backend**: Flask 2.3.3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API Communication**: Fetch API
- **Data Source**: Monday.com GraphQL API
- **CORS**: Flask-CORS

## Frontend Highlights

- **Responsive Grid Layout** - Adapts to all screen sizes
- **Hebrew RTL Support** - Full right-to-left text support
- **Color-coded Cards** - Different colors for different metric types
- **Two-Column Comparison** - Side-by-side country data comparison
- **Loading States** - Animated spinner during data fetch
- **Error Handling** - User-friendly error messages
- **Auto-refresh** - Updates every 5 minutes

## Customization

### Change Board ID
Edit `main.py`:
```python
BOARD_ID = YOUR_BOARD_ID
```

### Change Server Port
Edit the last line in `main.py`:
```python
app.run(debug=True, host='0.0.0.0', port=YOUR_PORT)
```

### Change Monday Column IDs
Update the column ID constants in the data processing functions:
- `status_mkmb1zc6` - Incident type column
- `country_mkmb91h3` - Country column
- `timeline_mkmbcabh` - Timeline column
- `color_mkvvrm1r` - Status column
- `check_mkn3c7v8` - Life-threatening column

## Deployment

### Development
```bash
python main.py
```

### Production
Use Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

Or use Docker:
```bash
docker run -p 5000:5000 -e MONDAY_API_KEY=your_key your_image:latest
```

## Data Processing Functions

### `fetch_monday_data()`
Fetches all incidents from Monday.com GraphQL API

### `count_incidents_per_type(incidents_list)`
Counts incidents grouped by type

### `get_incidents_current_month(incidents_list)`
Filters incidents from the current month

### `get_countries_of_incidents(incidents_list)`
Extracts and counts countries from incidents

### `get_our_impact(incidents_list)`
Calculates impact metrics (lives saved, life-threatening incidents)

## Troubleshooting

### Module Not Found
```bash
pip install -r requirements.txt
```

### CORS Issues
Ensure Flask-CORS is properly initialized (already done in main.py)

### API Returns 500 Error
1. Check `MONDAY_API_KEY` in `.env`
2. Verify `BOARD_ID` is correct
3. Check Monday.com API availability
4. Review console logs for specific errors

### Column Data Not Appearing
Update the column IDs in the data processing functions to match your Monday.com board

## License

Internal use only.

