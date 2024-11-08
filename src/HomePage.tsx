import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from "moment-timezone";

interface Bike {
  dockNumber: number;
  battery: number;
}

interface Station {
  properties: Properties
}

interface Properties {
  kioskId: string;
  latitude: number;
  longitude: number;
  bikes: Bike[];
  name: string;
}

interface Weather {
  main: WeatherMain
}

interface WeatherMain {
  temp: number;
}

interface Result {
  at: string;
  stations: Station;
  weather: Weather 
}

function HomePage() {
  const navigate = useNavigate()
  const loaded = useRef(false)
  const [stationType, setStationType] = useState(1)
  const [dateTime, setDateTime] = useState('')
  const [kioskId, setKioskId] = useState('')
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Result[]>([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)

  useEffect(() => {
    if(loaded.current === false) {
      checkAuth();

      const nowDateTime = moment().tz("Asia/Singapore").format("YYYY-MM-DD HH:mm:ss");
      setDateTime(nowDateTime)

      return () => { loaded.current = true }
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/check-auth', {
        method: 'GET',
      });

      if (response.status !== 200) {
        console.log("Unauthenticated")
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      const response = await fetch("http://localhost:3000/api/v1/logout", {
        method: "POST",
      });

      setLogoutLoading(false)

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data)
        navigate('/login')
      } else {
        console.error("Logout failed:", response.statusText)
      }
    } catch (error) {
      setLogoutLoading(false)
      console.error("An error occurred:", error)
    }
  };

  const submitStation = async() => {
    try {
      if(stationType != 1 && stationType != 2) {
        console.error("Invalid station type")
        return
      }
      setLoading(true)
      setData([])
      var url = ""
      let newDateTime = moment(dateTime).tz("Asia/Singapore").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      if(stationType == 1) {
        // full
        url = `http://localhost:3000/api/v1/stations?at=${encodeURIComponent(newDateTime)}`;
      } else if(stationType == 2) {
        url = `http://localhost:3000/api/v1/stations/${encodeURIComponent(kioskId)}?at=${newDateTime}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Token": "bike001",
        },
      });

      setLoading(false)

      if (response.ok) {
        const data = await response.json();
        if(stationType == 1) {
          if(data.Data.length > 0) {
            setData(data.Data)
          }
        } else if(stationType == 2 && data.Data) {
          setData([data.Data])
        }
        
      } else {
        console.error("Fetch station failed:", response.statusText)
      }
    } catch (error) {
      setLoading(false)
      console.error("An error occurred:", error)
    }
  }

  const celsius = (kelvin:number) => {
    return (kelvin - 273.15).toFixed(2)
  }

  const handleFetchData = async() => {
    try {
      setFetchLoading(true)
      const response = await fetch("http://localhost:3000/api/v1/indego-data-fetch-and-store-it-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Token": "bike001",
        },
      });

      setFetchLoading(false)

      if (response.ok) {
        const data = await response.json();
        console.log("Fetch and store successful:", data)
        setLastUpdated(data.Data)
        setDateTime(data.Data)
      } else {
        console.error("Fetch and store failed:", response.statusText)
      }
    } catch (error) {
      setFetchLoading(false)
      console.error("An error occurred:", error)
    }
  }

  return (
    <div>
      <div className='header'>
        <button className='default-btn red' disabled={logoutLoading} onClick={handleLogout}>Logout</button>
        <button className='default-btn green' style={{ marginRight: '10px'}} disabled={fetchLoading} onClick={handleFetchData}>
          { fetchLoading ? "Loading..." : "Fetch Indego data"}
        </button>
      </div>
      <div className='form-container'>
        <div className='form'>
          {
            lastUpdated ? (
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Last fetch updated at : {lastUpdated}</div>
            ) : null
          }
          
          <div className='form-box'>
            <div className='custom-radio'>
              <input id="station_type_1" type="radio" name="station_type" value={1} checked={stationType === 1} onChange={() => setStationType(1)} />
              <label htmlFor="station_type_1">Full</label>
            </div>

            <div className='custom-radio'>
              <input id="station_type_2" type="radio" name="station_type" value={2} checked={stationType === 2} onChange={() => setStationType(2)} />
              <label htmlFor="station_type_2">Single station</label>
            </div>

          </div>
          {
            stationType == 2 ? (
              <div>
                <input className='custom-input' type="text" placeholder="kiosk Id" required value={kioskId} onChange={(e) => setKioskId(e.target.value)} />
              </div>
            ) : null
          }
          <div>
            <input className='custom-input' type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>

          <div>
            <button className='default-btn green' disabled={loading} onClick={submitStation}>Submit</button>
          </div>
        </div>
      </div>
      <div className='table-container'>
        <div className='table-box'>
          <table className='custom-table'>
            <thead>
              <tr>
                <td>At</td>
                <td>Kiosk Id</td>
                <td>Geometry</td>
                <td width={150}>Address</td>
                <td>Bikes</td>
                <td>Temperature</td>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row) => (
                <tr key={row.stations.properties.kioskId}>
                  <td>{row.at}</td>
                  <td>{row.stations.properties.kioskId}</td>
                  <td>Latitude: {row.stations.properties.latitude} <br/>Longitude: {row.stations.properties.longitude}</td>
                  <td>{row.stations.properties.name}</td>
                  <td>
                    { row.stations.properties.bikes ? (
                      row.stations.properties.bikes.map((bike, index) => (
                        <div key={index} className='bike-container'>
                          <div>Docker number : { bike.dockNumber }</div>
                          {bike.battery ? (
                            <div>Battery : { bike.battery }%</div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div>No bikes available</div>
                    )}
                  </td>
                  <td>{celsius(row.weather.main.temp)}°C</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HomePage;