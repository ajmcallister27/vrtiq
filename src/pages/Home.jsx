import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Loader2, Navigation, Plus, Mountain, TrendingUp, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ResortCard from '../components/ResortCard';
import RunCard from '../components/RunCard';
import EmptyState from '../components/EmptyState';
import NearbyResortMap from '../components/NearbyResortMap';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { data: resorts = [], isLoading: resortsLoading } = useQuery({
    queryKey: ['resorts'],
    queryFn: () => base44.entities.Resort.list()
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => base44.entities.Run.list()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.DifficultyRating.list()
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

  // Resorts where user has rated a run (favorites)
  const favoriteResortIds = new Set(
    ratings
      .map(r => {
        const run = runs.find(run => run.id === r.run_id);
        return run?.resort_id;
      })
      .filter(Boolean)
  );

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
    <div className="pb-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Find Real Difficulty
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Crowd-sourced ratings from skiers, not marketing
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
      <div className="px-4 space-y-8">
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
                  <div className="space-y-2">
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
                <p className="text-sm text-slate-400 py-4 text-center">Rate a run to track resorts you've visited</p>
              ) : (
                <div className="space-y-2">
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
              <div className="space-y-2">
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
            <div className="space-y-2">
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