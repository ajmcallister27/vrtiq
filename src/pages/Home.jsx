import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Loader2, Navigation, Mountain, TrendingUp, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import ResortCard from '../components/ResortCard';
import RunCard from '../components/RunCard';
import EmptyState from '../components/EmptyState';
import NearbyResortMap from '../components/NearbyResortMap';
import { useRatingMode } from '@/lib/RatingModeContext';
import { getRatingModeLabel } from '@/lib/ratingMode';
import { getFavoriteResortIdSet } from '@/lib/userResorts';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { user } = useAuth();
  const { ratingMode } = useRatingMode();

  const { data: resorts = [], isLoading: resortsLoading } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => api.entities.Resort.list()
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.entities.Run.list()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', ratingMode],
    queryFn: () => api.entities.DifficultyRating.filter({ mode: ratingMode })
  });

  const { data: lifts = [] } = useQuery({
    queryKey: ['lifts'],
    queryFn: () => api.entities.Lift.list('name')
  });

  const { data: liftReports = [] } = useQuery({
    queryKey: ['lift-wait-reports-home'],
    queryFn: () => api.entities.LiftWaitReport.list('-created_date')
  });

  // Calculate run counts per resort
  const runCountByResort = runs.reduce((acc, run) => {
    acc[run.resort_id] = (acc[run.resort_id] || 0) + 1;
    return acc;
  }, {});

  // Calculate average ratings per run
  const ratingsByRun = ratings.reduce((acc, rating) => {
    if (!acc[rating.run_id]) acc[rating.run_id] = [];
    acc[rating.run_id].push(rating.rating);
    return acc;
  }, {});

  const avgRatingByRun = Object.entries(ratingsByRun).reduce((acc, [runId, ratings]) => {
    acc[runId] = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return acc;
  }, {});

  // Get recently rated runs
  const recentlyRatedRuns = runs
    .filter(run => avgRatingByRun[run.id])
    .sort((a, b) => (avgRatingByRun[b.id] || 0) - (avgRatingByRun[a.id] || 0))
    .slice(0, 5);

  // Filtered resorts
  const filteredResorts = resorts.filter(resort =>
    resort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resort.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate distance (haversine)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Get user location
  const requestLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationLoading(false);
    }
  };

  // Resorts where the authenticated user has rated a run
  const favoriteResortIds = getFavoriteResortIdSet({ user, ratings, runs });

  const fastestLiftRows = (() => {
    if (favoriteResortIds.size === 0) {
      return [];
    }

    const reportsByLiftKey = liftReports.reduce((acc, report) => {
      const key = report.lift_id || `${report.resort_id}:${report.lift_name}`;
      if (!key) {
        return acc;
      }
      if (!acc[key]) {
        acc[key] = [];
      }
      if (acc[key].length < 2 && report.report_status !== 'closed') {
        acc[key].push(report);
      }
      return acc;
    }, {});

    return lifts
      .filter((lift) => favoriteResortIds.has(lift.resort_id))
      .map((lift) => {
        const key = lift.id || `${lift.resort_id}:${lift.name}`;
        const recentReports = reportsByLiftKey[key] || [];
        const avgWait = recentReports.length
          ? recentReports.reduce((sum, report) => sum + report.wait_minutes, 0) / recentReports.length
          : null;
        return {
          lift,
          avgWait,
          reportCount: recentReports.length,
          resortName: resorts.find((resort) => resort.id === lift.resort_id)?.name || 'Unknown Resort'
        };
      })
      .filter((row) => row.avgWait !== null)
      .sort((a, b) => a.avgWait - b.avgWait)
      .slice(0, 5);
  })();

  // Sort resorts by distance if we have location — only resorts with valid coords
  const resortsWithCoords = filteredResorts.filter(r => r.latitude && r.longitude);
  const resortsWithoutCoords = filteredResorts.filter(r => !r.latitude || !r.longitude);

  const sortedResorts = userLocation
    ? [
        ...resortsWithCoords.sort((a, b) =>
          getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude) -
          getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
        ),
        ...resortsWithoutCoords
      ]
    : filteredResorts;

  // Attach distance to resorts for display
  const resortsWithDistance = userLocation
    ? sortedResorts.map(r => ({
        ...r,
        distanceMi: r.latitude && r.longitude
          ? Math.round(getDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude))
          : null
      }))
    : sortedResorts;

  // Nearby = within 150 miles (only when location is set), otherwise empty
  const NEARBY_RADIUS = 150;
  const nearbyResorts = userLocation
    ? resortsWithDistance.filter(r => r.distanceMi !== null && r.distanceMi <= NEARBY_RADIUS)
    : [];

  // Favorite resorts
  const favoriteResorts = resorts
    .filter(r => favoriteResortIds.has(r.id))
    .map(r => ({
      ...r,
      distanceMi: userLocation && r.latitude && r.longitude
        ? Math.round(getDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude))
        : null
    }));

  // What to show in the resort section
  const displayResorts = searchQuery
    ? resortsWithDistance.slice(0, 6)
    : userLocation
    ? nearbyResorts.slice(0, 6)
    : favoriteResorts.slice(0, 6);

  const resortMap = resorts.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white px-4 pt-6 pb-8 lg:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Find Real Difficulty
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Crowd-sourced ratings for {getRatingModeLabel(ratingMode).toLowerCase()} mode
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search resorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-200 rounded-xl"
          />
        </div>

        {/* Location Button */}
        {!userLocation && (
          <Button
            variant="outline"
            onClick={requestLocation}
            disabled={locationLoading}
            className="w-full h-11 rounded-xl border-slate-200 text-slate-600"
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use my location
          </Button>
        )}
        {userLocation && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm text-green-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Sorted by distance from you</span>
              </div>
              <button
                onClick={() => setUserLocation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <NearbyResortMap
              userLocation={userLocation}
              resorts={sortedResorts}
              runCountByResort={runCountByResort}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 space-y-8 lg:px-6">
        {/* Nearby / Favorite Resorts */}
        {!searchQuery && (
          <>
            {/* Nearby */}
            {userLocation && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-900">Nearby Resorts</h2>
                  <Link to={createPageUrl('Resorts')} className="text-sm text-sky-500 font-medium">See all</Link>
                </div>
                {resortsLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                ) : nearbyResorts.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No resorts within {NEARBY_RADIUS} miles</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {nearbyResorts.slice(0, 6).map(resort => (
                      <ResortCard key={resort.id} resort={resort} runCount={runCountByResort[resort.id] || 0} distanceMi={resort.distanceMi} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Favorites */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h2 className="font-semibold text-slate-900">Your Resorts</h2>
                </div>
                <Link to={createPageUrl('Resorts')} className="text-sm text-sky-500 font-medium">See all</Link>
              </div>
              {resortsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : favoriteResorts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No personal resort ratings yet. Rate a run to start building your list.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {favoriteResorts.slice(0, 6).map(resort => (
                    <ResortCard key={resort.id} resort={resort} runCount={runCountByResort[resort.id] || 0} distanceMi={resort.distanceMi} />
                  ))}
                </div>
              )}
            </section>

            {!userLocation && favoriteResorts.length === 0 && (
              <EmptyState
                icon={Mountain}
                title="Discover resorts"
                description="Use your location to find nearby resorts, or rate a run to track ones you've visited"
                action={
                  <Link to={createPageUrl('Resorts')}>
                    <Button variant="outline" className="rounded-xl">Browse All Resorts</Button>
                  </Link>
                }
              />
            )}

            {favoriteResorts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-900">Fastest Lifts in Your Resorts</h2>
                  <Link to={createPageUrl('LiftBoard')} className="text-sm text-sky-500 font-medium">See all lifts</Link>
                </div>

                {fastestLiftRows.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No lift wait reports yet for your resorts.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {fastestLiftRows.map(({ lift, avgWait, reportCount, resortName }) => (
                      <Link key={lift.id} to={createPageUrl(`Lift?id=${lift.id}`)} className="block p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{lift.name}</p>
                            <p className="text-xs text-slate-500">{resortName} · based on last {reportCount} report{reportCount === 1 ? '' : 's'}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                            {Math.round(avgWait)} min
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Search results */}
        {searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Search Results</h2>
              <Link to={createPageUrl('Resorts')} className="text-sm text-sky-500 font-medium">See all</Link>
            </div>
            {resortsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : displayResorts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No resorts match "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {displayResorts.map(resort => (
                  <ResortCard key={resort.id} resort={resort} runCount={runCountByResort[resort.id] || 0} distanceMi={resort.distanceMi} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Top Rated Runs */}
        {recentlyRatedRuns.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h2 className="font-semibold text-slate-900">Top Rated Runs</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {recentlyRatedRuns.map(run => (
                <RunCard
                  key={run.id}
                  run={run}
                  avgRating={avgRatingByRun[run.id]}
                  ratingCount={ratingsByRun[run.id]?.length}
                  resortName={resortMap[run.resort_id]?.name}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}