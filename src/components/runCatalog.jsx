// Known runs for major resorts
// resort_name must match exactly what's in RESORT_CATALOG
export const RUN_CATALOG = [
  // ── VAIL ──
  { resort_name: 'Vail', name: 'Prima', official_difficulty: 'black', lift: 'Northstar Express', vertical_drop: 770, length_ft: 4800, average_pitch: 28, max_pitch: 38, groomed: false, description: 'Classic mogul run on the North Face' },
  { resort_name: 'Vail', name: 'Highline', official_difficulty: 'black', lift: 'Northstar Express', vertical_drop: 820, length_ft: 5200, average_pitch: 30, max_pitch: 40, groomed: false, description: 'Long demanding bump run' },
  { resort_name: 'Vail', name: 'Riva Ridge', official_difficulty: 'blue', lift: 'Gondola One', vertical_drop: 1200, length_ft: 9400, average_pitch: 16, max_pitch: 24, groomed: true, description: 'Long cruiser down the front face' },
  { resort_name: 'Vail', name: 'Born Free', official_difficulty: 'green', lift: 'Gondola One', vertical_drop: 800, length_ft: 7920, average_pitch: 10, max_pitch: 15, groomed: true, description: 'Classic beginner route' },
  { resort_name: 'Vail', name: 'Blue Ox', official_difficulty: 'blue', lift: 'Wildwood Express', vertical_drop: 900, length_ft: 5800, average_pitch: 18, max_pitch: 28, groomed: true, description: 'Popular groomed cruiser' },
  { resort_name: 'Vail', name: 'Roger\'s Run', official_difficulty: 'black', lift: 'Highline Express', vertical_drop: 1100, length_ft: 6000, average_pitch: 32, max_pitch: 44, groomed: false, description: 'Steep mogul terrain' },
  { resort_name: 'Vail', name: 'Pepi\'s Face', official_difficulty: 'black', lift: 'Gondola One', vertical_drop: 700, length_ft: 4000, average_pitch: 34, max_pitch: 46, groomed: false, description: 'Steep and sustained' },
  { resort_name: 'Vail', name: 'Headwall', official_difficulty: 'double_black', lift: 'Northstar Express', vertical_drop: 600, length_ft: 2800, average_pitch: 40, max_pitch: 52, groomed: false, description: 'Extreme steep mogul run' },
  { resort_name: 'Vail', name: 'Genghis Khan', official_difficulty: 'double_black', lift: 'Northstar Express', vertical_drop: 580, length_ft: 2600, average_pitch: 42, max_pitch: 55, groomed: false, description: 'One of Vail\'s steepest shots' },
  { resort_name: 'Vail', name: 'Game Creek Bowl', official_difficulty: 'blue', lift: 'Game Creek Express', vertical_drop: 1400, length_ft: 8000, average_pitch: 20, max_pitch: 30, groomed: true, description: 'Wide open bowl cruising' },

  // ── BEAVER CREEK ──
  { resort_name: 'Beaver Creek', name: 'Grouse Mountain', official_difficulty: 'double_black', lift: 'Grouse Mountain Express', vertical_drop: 1800, length_ft: 7200, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Long sustained expert terrain' },
  { resort_name: 'Beaver Creek', name: 'Centennial', official_difficulty: 'black', lift: 'Centennial Express', vertical_drop: 1200, length_ft: 5800, average_pitch: 30, max_pitch: 42, groomed: false, description: 'Classic World Cup race course' },
  { resort_name: 'Beaver Creek', name: 'Beaver Creek Lane', official_difficulty: 'blue', lift: 'Centennial Express', vertical_drop: 1000, length_ft: 6400, average_pitch: 18, max_pitch: 26, groomed: true, description: 'Smooth intermediate groomer' },
  { resort_name: 'Beaver Creek', name: 'Drink of Water', official_difficulty: 'green', lift: 'Strawberry Park Express', vertical_drop: 600, length_ft: 5000, average_pitch: 10, max_pitch: 15, groomed: true, description: 'Gentle beginner run' },
  { resort_name: 'Beaver Creek', name: 'Ripsaw', official_difficulty: 'double_black', lift: 'Grouse Mountain Express', vertical_drop: 900, length_ft: 3600, average_pitch: 42, max_pitch: 58, groomed: false, description: 'Extreme steep and narrow' },

  // ── BRECKENRIDGE ──
  { resort_name: 'Breckenridge', name: 'Devil\'s Crotch', official_difficulty: 'double_black', lift: 'Imperial Express SuperChair', vertical_drop: 1000, length_ft: 4200, average_pitch: 38, max_pitch: 50, groomed: false, description: 'High-altitude expert chute' },
  { resort_name: 'Breckenridge', name: 'Cucumber Bowl', official_difficulty: 'double_black', lift: 'Imperial Express SuperChair', vertical_drop: 1100, length_ft: 4800, average_pitch: 36, max_pitch: 48, groomed: false, description: 'Open expert bowl at 13,000 ft' },
  { resort_name: 'Breckenridge', name: 'Volunteer', official_difficulty: 'blue', lift: 'Colorado SuperChair', vertical_drop: 1400, length_ft: 9200, average_pitch: 18, max_pitch: 26, groomed: true, description: 'Long cruiser down Peak 8' },
  { resort_name: 'Breckenridge', name: 'Lehman', official_difficulty: 'black', lift: 'Peak 8 SuperConnect', vertical_drop: 1200, length_ft: 5500, average_pitch: 30, max_pitch: 42, groomed: false, description: 'Classic black on Peak 8' },
  { resort_name: 'Breckenridge', name: 'Psychopath', official_difficulty: 'double_black', lift: 'Peak 6 Six-Pack', vertical_drop: 800, length_ft: 3200, average_pitch: 40, max_pitch: 54, groomed: false, description: 'Steep expert terrain on Peak 6' },
  { resort_name: 'Breckenridge', name: 'Four O\'Clock', official_difficulty: 'blue', lift: 'Colorado SuperChair', vertical_drop: 1600, length_ft: 10560, average_pitch: 16, max_pitch: 22, groomed: true, description: 'Longest groomed run at Breck' },

  // ── KEYSTONE ──
  { resort_name: 'Keystone', name: 'The Outback', official_difficulty: 'black', lift: 'Outback Express', vertical_drop: 1200, length_ft: 5800, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Tree skiing on the backside' },
  { resort_name: 'Keystone', name: 'Paymaster', official_difficulty: 'blue', lift: 'River Run Gondola', vertical_drop: 900, length_ft: 6000, average_pitch: 17, max_pitch: 24, groomed: true, description: 'Popular intermediate groomer' },
  { resort_name: 'Keystone', name: 'Spring Dipper', official_difficulty: 'green', lift: 'Santiago Express', vertical_drop: 700, length_ft: 7920, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Classic beginner cruiser' },
  { resort_name: 'Keystone', name: 'Last Hoot', official_difficulty: 'double_black', lift: 'North Peak Express', vertical_drop: 700, length_ft: 3000, average_pitch: 38, max_pitch: 50, groomed: false, description: 'Steep expert terrain at North Peak' },

  // ── PARK CITY MOUNTAIN ──
  { resort_name: 'Park City Mountain', name: 'Thaynes Canyon', official_difficulty: 'black', lift: 'Thaynes Lift', vertical_drop: 1000, length_ft: 5000, average_pitch: 30, max_pitch: 42, groomed: false, description: 'Classic Park City bump run' },
  { resort_name: 'Park City Mountain', name: 'Pioneer', official_difficulty: 'blue', lift: 'Bonanza Lift', vertical_drop: 1100, length_ft: 7400, average_pitch: 17, max_pitch: 25, groomed: true, description: 'Long sweeping groomer' },
  { resort_name: 'Park City Mountain', name: 'Indicator', official_difficulty: 'double_black', lift: 'Ninety Nine 90 Lift', vertical_drop: 900, length_ft: 3800, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Extreme steep at the top of 9990' },
  { resort_name: 'Park City Mountain', name: 'King Con', official_difficulty: 'green', lift: 'Paymaster Lift', vertical_drop: 800, length_ft: 8400, average_pitch: 10, max_pitch: 15, groomed: true, description: 'Gentle beginner terrain' },

  // ── WHISTLER BLACKCOMB ──
  { resort_name: 'Whistler Blackcomb', name: 'Couloir Extreme', official_difficulty: 'double_black', lift: 'Peak Express', vertical_drop: 1200, length_ft: 4500, average_pitch: 42, max_pitch: 60, groomed: false, description: 'Extreme couloir off Whistler Peak' },
  { resort_name: 'Whistler Blackcomb', name: 'Dave Murray Downhill', official_difficulty: 'black', lift: 'Creekside Gondola', vertical_drop: 3300, length_ft: 19800, average_pitch: 22, max_pitch: 35, groomed: false, description: 'Full World Cup Downhill course' },
  { resort_name: 'Whistler Blackcomb', name: 'Seventh Heaven', official_difficulty: 'blue', lift: 'Seventh Heaven Express', vertical_drop: 1800, length_ft: 10000, average_pitch: 18, max_pitch: 26, groomed: true, description: 'Classic Blackcomb groomer' },
  { resort_name: 'Whistler Blackcomb', name: 'Spanky\'s Ladder', official_difficulty: 'double_black', lift: 'Glacier Express', vertical_drop: 1600, length_ft: 6200, average_pitch: 36, max_pitch: 50, groomed: false, description: 'Legendary hike-to terrain' },
  { resort_name: 'Whistler Blackcomb', name: 'Franz\'s Run', official_difficulty: 'green', lift: 'Whistler Village Gondola', vertical_drop: 1200, length_ft: 11000, average_pitch: 10, max_pitch: 16, groomed: true, description: 'Long beginner cruiser' },
  { resort_name: 'Whistler Blackcomb', name: 'Harmony Ridge', official_difficulty: 'blue', lift: 'Harmony Express', vertical_drop: 1500, length_ft: 9000, average_pitch: 19, max_pitch: 28, groomed: true, description: 'Panoramic alpine cruiser' },

  // ── HEAVENLY ──
  { resort_name: 'Heavenly', name: 'Gunbarrel', official_difficulty: 'double_black', lift: 'Sky Express', vertical_drop: 1800, length_ft: 6200, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Long steep mogul field' },
  { resort_name: 'Heavenly', name: 'Milky Way Bowl', official_difficulty: 'black', lift: 'Dipper Express', vertical_drop: 1100, length_ft: 5000, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Open bowl with views of Tahoe' },
  { resort_name: 'Heavenly', name: 'Olympic Downhill', official_difficulty: 'blue', lift: 'Aerial Tram', vertical_drop: 1600, length_ft: 9200, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Classic Nevada side groomer' },
  { resort_name: 'Heavenly', name: 'Groove', official_difficulty: 'green', lift: 'Gondola', vertical_drop: 900, length_ft: 8000, average_pitch: 10, max_pitch: 15, groomed: true, description: 'Beginner friendly descent' },

  // ── STOWE ──
  { resort_name: 'Stowe', name: 'Goat', official_difficulty: 'double_black', lift: 'Forerunner Quad', vertical_drop: 1600, length_ft: 5500, average_pitch: 36, max_pitch: 50, groomed: false, description: 'Legendary narrow New England mogul run' },
  { resort_name: 'Stowe', name: 'Starr', official_difficulty: 'double_black', lift: 'Forerunner Quad', vertical_drop: 1500, length_ft: 5200, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Steep classic with bumps and trees' },
  { resort_name: 'Stowe', name: 'Liftline', official_difficulty: 'double_black', lift: 'Forerunner Quad', vertical_drop: 1700, length_ft: 5800, average_pitch: 40, max_pitch: 54, groomed: false, description: 'Iconic fall-line mogul strip' },
  { resort_name: 'Stowe', name: 'National', official_difficulty: 'black', lift: 'Forerunner Quad', vertical_drop: 1400, length_ft: 5000, average_pitch: 30, max_pitch: 42, groomed: false, description: 'World Cup bump run' },
  { resort_name: 'Stowe', name: 'Perry Merrill', official_difficulty: 'blue', lift: 'Gondola', vertical_drop: 1100, length_ft: 7400, average_pitch: 17, max_pitch: 24, groomed: true, description: 'Smooth top-to-bottom groomer' },
  { resort_name: 'Stowe', name: 'Easy Street', official_difficulty: 'green', lift: 'Gondola', vertical_drop: 800, length_ft: 8800, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Welcoming beginner terrain' },

  // ── MAMMOTH MOUNTAIN ──
  { resort_name: 'Mammoth Mountain', name: 'Cornice Bowl', official_difficulty: 'double_black', lift: 'Cornice Express', vertical_drop: 1200, length_ft: 4500, average_pitch: 38, max_pitch: 52, groomed: false, description: 'High alpine bowl exposure' },
  { resort_name: 'Mammoth Mountain', name: 'Hangman\'s Hollow', official_difficulty: 'double_black', lift: 'Cornice Express', vertical_drop: 900, length_ft: 3500, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Steep chute off the summit' },
  { resort_name: 'Mammoth Mountain', name: 'Road Runner', official_difficulty: 'blue', lift: 'Broadway Express', vertical_drop: 1400, length_ft: 9600, average_pitch: 16, max_pitch: 24, groomed: true, description: 'Long high-speed groomer' },
  { resort_name: 'Mammoth Mountain', name: 'Fascination', official_difficulty: 'green', lift: 'Stump Alley Express', vertical_drop: 900, length_ft: 8800, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Classic beginner run' },
  { resort_name: 'Mammoth Mountain', name: 'Dragon\'s Back', official_difficulty: 'black', lift: 'Roller Coaster Express', vertical_drop: 1000, length_ft: 4800, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Narrow ridge run with exposure' },

  // ── JACKSON HOLE ──
  { resort_name: 'Jackson Hole', name: 'Corbet\'s Couloir', official_difficulty: 'double_black', lift: 'Aerial Tram', vertical_drop: 1000, length_ft: 3600, average_pitch: 45, max_pitch: 65, groomed: false, description: 'America\'s most famous expert entrance' },
  { resort_name: 'Jackson Hole', name: 'Hobacks', official_difficulty: 'black', lift: 'Sublette Quad', vertical_drop: 1800, length_ft: 8800, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Massive south-facing powder bowl' },
  { resort_name: 'Jackson Hole', name: 'Laramie Bowl', official_difficulty: 'double_black', lift: 'Aerial Tram', vertical_drop: 1200, length_ft: 4500, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Expert chutes off the summit' },
  { resort_name: 'Jackson Hole', name: 'Casper Bowl', official_difficulty: 'black', lift: 'Casper Chairlift', vertical_drop: 1400, length_ft: 6000, average_pitch: 30, max_pitch: 44, groomed: false, description: 'Protected north-facing powder stash' },
  { resort_name: 'Jackson Hole', name: 'Amphitheater', official_difficulty: 'blue', lift: 'Teton Village Gondola', vertical_drop: 1600, length_ft: 9000, average_pitch: 18, max_pitch: 27, groomed: true, description: 'Big mountain groomed terrain' },
  { resort_name: 'Jackson Hole', name: 'Werner', official_difficulty: 'green', lift: 'Teton Village Gondola', vertical_drop: 1200, length_ft: 11000, average_pitch: 10, max_pitch: 16, groomed: true, description: 'Beginner friendly with big views' },

  // ── ALTA ──
  { resort_name: 'Alta', name: 'High Rustler', official_difficulty: 'black', lift: 'Wildcat Lift', vertical_drop: 1000, length_ft: 4200, average_pitch: 30, max_pitch: 44, groomed: false, description: 'Legendary steep Alta classic' },
  { resort_name: 'Alta', name: 'East Greeley', official_difficulty: 'double_black', lift: 'Sugarloaf Quad', vertical_drop: 1200, length_ft: 4600, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Expert terrain off Sugarloaf' },
  { resort_name: 'Alta', name: 'Mambo', official_difficulty: 'blue', lift: 'Collins Lift', vertical_drop: 900, length_ft: 6200, average_pitch: 18, max_pitch: 26, groomed: true, description: 'Popular intermediate groomer' },
  { resort_name: 'Alta', name: 'Sunnyside', official_difficulty: 'green', lift: 'Sunnyside Lift', vertical_drop: 600, length_ft: 5500, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Ideal beginner terrain' },
  { resort_name: 'Alta', name: 'West Rustler', official_difficulty: 'black', lift: 'Wildcat Lift', vertical_drop: 1100, length_ft: 4800, average_pitch: 32, max_pitch: 46, groomed: false, description: 'Powder stash above the trees' },

  // ── SNOWBIRD ──
  { resort_name: 'Snowbird', name: 'Great Scott', official_difficulty: 'double_black', lift: 'Aerial Tram', vertical_drop: 1500, length_ft: 5200, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Iconic steep couloir off the tram' },
  { resort_name: 'Snowbird', name: 'Regulator Johnson', official_difficulty: 'double_black', lift: 'Aerial Tram', vertical_drop: 1400, length_ft: 4800, average_pitch: 42, max_pitch: 58, groomed: false, description: 'Classic expert shot' },
  { resort_name: 'Snowbird', name: 'Baldy Chutes', official_difficulty: 'double_black', lift: 'Aerial Tram', vertical_drop: 1200, length_ft: 4000, average_pitch: 44, max_pitch: 60, groomed: false, description: 'Multiple steep couloirs' },
  { resort_name: 'Snowbird', name: 'Chip\'s Run', official_difficulty: 'blue', lift: 'Wilbere Lift', vertical_drop: 1000, length_ft: 7000, average_pitch: 18, max_pitch: 26, groomed: true, description: 'Smooth intermediate trail' },
  { resort_name: 'Snowbird', name: 'Big Emma', official_difficulty: 'green', lift: 'Chickadee Lift', vertical_drop: 700, length_ft: 6000, average_pitch: 10, max_pitch: 15, groomed: true, description: 'Beginner area main run' },

  // ── KILLINGTON ──
  { resort_name: 'Killington', name: 'Superstar', official_difficulty: 'double_black', lift: 'K-1 Gondola', vertical_drop: 1200, length_ft: 4600, average_pitch: 36, max_pitch: 50, groomed: false, description: 'Famous mogul field and race venue' },
  { resort_name: 'Killington', name: 'Outer Limits', official_difficulty: 'double_black', lift: 'Skye Peak Quad', vertical_drop: 1000, length_ft: 4000, average_pitch: 38, max_pitch: 54, groomed: false, description: 'Steep narrow expert run' },
  { resort_name: 'Killington', name: 'Cascade', official_difficulty: 'black', lift: 'K-1 Gondola', vertical_drop: 1500, length_ft: 6500, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Long challenging black' },
  { resort_name: 'Killington', name: 'Great Eastern', official_difficulty: 'green', lift: 'K-1 Gondola', vertical_drop: 2000, length_ft: 17820, average_pitch: 9, max_pitch: 15, groomed: true, description: 'One of the longest beginner runs in the East' },
  { resort_name: 'Killington', name: 'Rime', official_difficulty: 'blue', lift: 'Snowdon Quad', vertical_drop: 1100, length_ft: 7200, average_pitch: 17, max_pitch: 25, groomed: true, description: 'Wide groomed cruiser' },

  // ── ASPEN MOUNTAIN ──
  { resort_name: 'Aspen Mountain', name: 'Walsh\'s', official_difficulty: 'double_black', lift: 'Ajax Express', vertical_drop: 1200, length_ft: 4400, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Legendary Aspen expert run' },
  { resort_name: 'Aspen Mountain', name: 'Spar Gulch', official_difficulty: 'blue', lift: 'Gondola One', vertical_drop: 2200, length_ft: 14200, average_pitch: 15, max_pitch: 22, groomed: true, description: 'Main valley cruiser' },
  { resort_name: 'Aspen Mountain', name: 'Ruthie\'s Run', official_difficulty: 'blue', lift: 'Ruthie\'s Chair', vertical_drop: 1000, length_ft: 6800, average_pitch: 17, max_pitch: 25, groomed: true, description: 'Popular mid-mountain groomer' },
  { resort_name: 'Aspen Mountain', name: 'Kristi', official_difficulty: 'double_black', lift: 'Ajax Express', vertical_drop: 1100, length_ft: 4000, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Steep bump run on the face' },

  // ── STEAMBOAT ──
  { resort_name: 'Steamboat', name: 'Christmas Tree Bowl', official_difficulty: 'double_black', lift: 'Storm Peak Express', vertical_drop: 1400, length_ft: 5500, average_pitch: 36, max_pitch: 50, groomed: false, description: 'Famous tree skiing terrain' },
  { resort_name: 'Steamboat', name: 'Chutes 1-9', official_difficulty: 'double_black', lift: 'Storm Peak Express', vertical_drop: 1000, length_ft: 3800, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Steep couloirs at the summit' },
  { resort_name: 'Steamboat', name: 'Buddy\'s Run', official_difficulty: 'blue', lift: 'Christie Peak Express', vertical_drop: 1500, length_ft: 9600, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Classic Steamboat groomer' },
  { resort_name: 'Steamboat', name: 'Heavenly Daze', official_difficulty: 'green', lift: 'Thunderhead Express', vertical_drop: 1000, length_ft: 10000, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Scenic beginner cruise' },
  { resort_name: 'Steamboat', name: 'Cowboy Coffee', official_difficulty: 'black', lift: 'Sundown Express', vertical_drop: 1200, length_ft: 5200, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Steep tree run' },

  // ── WINTER PARK ──
  { resort_name: 'Winter Park', name: 'Mary Jane Face', official_difficulty: 'double_black', lift: 'Iron Horse Express', vertical_drop: 1500, length_ft: 5500, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Classic mogul mountain terrain' },
  { resort_name: 'Winter Park', name: 'Parsenn Bowl', official_difficulty: 'blue', lift: 'Panoramic Express', vertical_drop: 1200, length_ft: 8000, average_pitch: 16, max_pitch: 24, groomed: true, description: 'High alpine groomed bowl' },
  { resort_name: 'Winter Park', name: 'Vasquez Cirque', official_difficulty: 'double_black', lift: 'Panoramic Express', vertical_drop: 1800, length_ft: 6500, average_pitch: 38, max_pitch: 54, groomed: false, description: 'Hike-to expert bowl' },
  { resort_name: 'Winter Park', name: 'Allan Phipps', official_difficulty: 'green', lift: 'Gemini Express', vertical_drop: 900, length_ft: 9000, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Beginner cruiser' },

  // ── TELLURIDE ──
  { resort_name: 'Telluride', name: 'Plunge', official_difficulty: 'double_black', lift: 'Lift 9', vertical_drop: 1700, length_ft: 5500, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Legendary steep wall' },
  { resort_name: 'Telluride', name: 'The Plunge', official_difficulty: 'double_black', lift: 'Lift 9', vertical_drop: 1800, length_ft: 5700, average_pitch: 42, max_pitch: 58, groomed: false, description: 'One of the steepest runs in Colorado' },
  { resort_name: 'Telluride', name: 'Kant-Mak-M', official_difficulty: 'double_black', lift: 'Lift 9', vertical_drop: 1600, length_ft: 5000, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Extreme steeps' },
  { resort_name: 'Telluride', name: 'See Forever', official_difficulty: 'blue', lift: 'Prospect Express', vertical_drop: 1800, length_ft: 11000, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Long groomed with incredible views' },
  { resort_name: 'Telluride', name: 'Galloping Goose', official_difficulty: 'green', lift: 'Chondola', vertical_drop: 1200, length_ft: 11000, average_pitch: 9, max_pitch: 15, groomed: true, description: 'Town-to-mountain beginner route' },

  // ── BIG SKY ──
  { resort_name: 'Big Sky Resort', name: 'Big Couloir', official_difficulty: 'double_black', lift: 'Lone Peak Tram', vertical_drop: 1200, length_ft: 4200, average_pitch: 45, max_pitch: 62, groomed: false, description: 'Highest and most extreme run at Big Sky' },
  { resort_name: 'Big Sky Resort', name: 'Marx', official_difficulty: 'double_black', lift: 'Tram', vertical_drop: 2000, length_ft: 7500, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Long sustained expert descent' },
  { resort_name: 'Big Sky Resort', name: 'Liberty Bowl', official_difficulty: 'black', lift: 'Swift Current Express', vertical_drop: 1600, length_ft: 7000, average_pitch: 28, max_pitch: 42, groomed: false, description: 'Open bowl skiing' },
  { resort_name: 'Big Sky Resort', name: 'Ambush', official_difficulty: 'blue', lift: 'Ramcharger 8', vertical_drop: 1800, length_ft: 10500, average_pitch: 18, max_pitch: 28, groomed: true, description: 'Long high speed groomer' },
  { resort_name: 'Big Sky Resort', name: 'Morning Star', official_difficulty: 'green', lift: 'Explorer', vertical_drop: 1000, length_ft: 9200, average_pitch: 10, max_pitch: 16, groomed: true, description: 'Beginner terrain with great views' },

  // ── PALISADES TAHOE ──
  { resort_name: 'Palisades Tahoe', name: 'KT-22', official_difficulty: 'double_black', lift: 'KT-22 Express', vertical_drop: 1400, length_ft: 5000, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Legendary steep mountain' },
  { resort_name: 'Palisades Tahoe', name: 'Headwall', official_difficulty: 'double_black', lift: 'Headwall', vertical_drop: 800, length_ft: 3000, average_pitch: 44, max_pitch: 60, groomed: false, description: 'Extreme steep headwall' },
  { resort_name: 'Palisades Tahoe', name: 'Gold Coast', official_difficulty: 'blue', lift: 'Gold Coast', vertical_drop: 1200, length_ft: 7800, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Popular groomed cruiser' },
  { resort_name: 'Palisades Tahoe', name: 'Riviera', official_difficulty: 'green', lift: 'Riviera Lift', vertical_drop: 800, length_ft: 7200, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Mellow beginner terrain' },

  // ── DEER VALLEY ──
  { resort_name: 'Deer Valley', name: 'Daly Chutes', official_difficulty: 'double_black', lift: 'Daly Chutes Lift', vertical_drop: 1100, length_ft: 3800, average_pitch: 42, max_pitch: 58, groomed: false, description: 'Expert chutes through aspen glades' },
  { resort_name: 'Deer Valley', name: 'Stein\'s Way', official_difficulty: 'black', lift: 'Empire Canyon Express', vertical_drop: 1400, length_ft: 6200, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Classic DV black' },
  { resort_name: 'Deer Valley', name: 'Bald Eagle', official_difficulty: 'blue', lift: 'Bald Eagle Lift', vertical_drop: 1000, length_ft: 6500, average_pitch: 17, max_pitch: 25, groomed: true, description: 'Perfectly groomed intermediate run' },
  { resort_name: 'Deer Valley', name: 'Success', official_difficulty: 'green', lift: 'Success Lift', vertical_drop: 800, length_ft: 7800, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Gentle beginner terrain' },

  // ── ARAPAHOE BASIN ──
  { resort_name: 'Arapahoe Basin', name: 'The East Wall', official_difficulty: 'double_black', lift: 'East Wall Lift', vertical_drop: 800, length_ft: 3200, average_pitch: 42, max_pitch: 58, groomed: false, description: 'Extreme steep above treeline' },
  { resort_name: 'Arapahoe Basin', name: 'Pallavicini', official_difficulty: 'double_black', lift: 'Pallavicini Lift', vertical_drop: 1400, length_ft: 5500, average_pitch: 36, max_pitch: 52, groomed: false, description: 'Legendary Colorado mogul run' },
  { resort_name: 'Arapahoe Basin', name: 'Wrangler', official_difficulty: 'blue', lift: 'Lenawee Lift', vertical_drop: 1200, length_ft: 7000, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Popular mid-mountain groomer' },
  { resort_name: 'Arapahoe Basin', name: 'Sundance', official_difficulty: 'green', lift: 'Black Mountain Express', vertical_drop: 800, length_ft: 7200, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Beginner terrain' },

  // ── SUNDAY RIVER ──
  { resort_name: 'Sunday River', name: 'White Heat', official_difficulty: 'double_black', lift: 'Barker Mountain Express', vertical_drop: 1700, length_ft: 6200, average_pitch: 35, max_pitch: 50, groomed: false, description: 'Longest steepest mogul run in the East' },
  { resort_name: 'Sunday River', name: 'Oz', official_difficulty: 'double_black', lift: 'Jordan Bowl Quad', vertical_drop: 1000, length_ft: 3800, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Steep bump run in Jordan Bowl' },
  { resort_name: 'Sunday River', name: 'Lazy River', official_difficulty: 'blue', lift: 'North Peak Quad', vertical_drop: 1200, length_ft: 8400, average_pitch: 16, max_pitch: 24, groomed: true, description: 'Long winding groomer' },
  { resort_name: 'Sunday River', name: 'Lollapalooza', official_difficulty: 'green', lift: 'Sundance Lift', vertical_drop: 900, length_ft: 9000, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Beginner friendly run' },

  // ── SUGARLOAF ──
  { resort_name: 'Sugarloaf', name: 'Spillway', official_difficulty: 'double_black', lift: 'Spillway Lift', vertical_drop: 1200, length_ft: 4500, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Steep open bowl skiing' },
  { resort_name: 'Sugarloaf', name: 'Gonzo', official_difficulty: 'double_black', lift: 'SuperQuad', vertical_drop: 1000, length_ft: 4000, average_pitch: 38, max_pitch: 54, groomed: false, description: 'Expert terrain on the face' },
  { resort_name: 'Sugarloaf', name: 'Tote Road', official_difficulty: 'blue', lift: 'SuperQuad', vertical_drop: 1600, length_ft: 11000, average_pitch: 15, max_pitch: 24, groomed: true, description: 'Long beginner-friendly groomer' },

  // ── CRYSTAL MOUNTAIN (WA) ──
  { resort_name: 'Crystal Mountain', name: 'The Throne', official_difficulty: 'double_black', lift: 'Rainier Express', vertical_drop: 1200, length_ft: 4400, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Steep summit terrain' },
  { resort_name: 'Crystal Mountain', name: 'Lucky Shot', official_difficulty: 'black', lift: 'Chinook Express', vertical_drop: 1000, length_ft: 4600, average_pitch: 30, max_pitch: 44, groomed: false, description: 'Classic Crystal black' },
  { resort_name: 'Crystal Mountain', name: 'Iceberg Ridge', official_difficulty: 'blue', lift: 'Forest Queen Express', vertical_drop: 1400, length_ft: 8500, average_pitch: 18, max_pitch: 28, groomed: true, description: 'Scenic groomed ridge run' },
  { resort_name: 'Crystal Mountain', name: 'Tinkerbell', official_difficulty: 'green', lift: 'Discovery Lift', vertical_drop: 700, length_ft: 6800, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Beginner area classic' },

  // ── MT. BACHELOR ──
  { resort_name: 'Mt. Bachelor', name: 'Cow\'s Face', official_difficulty: 'double_black', lift: 'Summit Lift', vertical_drop: 1200, length_ft: 4500, average_pitch: 40, max_pitch: 55, groomed: false, description: 'Steep north face couloir' },
  { resort_name: 'Mt. Bachelor', name: 'Healy Heights', official_difficulty: 'blue', lift: 'Sunrise Express', vertical_drop: 1400, length_ft: 8800, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Wide groomed cruiser' },
  { resort_name: 'Mt. Bachelor', name: 'Easy Rider', official_difficulty: 'green', lift: 'Red Chair', vertical_drop: 800, length_ft: 7500, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Gentle beginner terrain' },

  // ── CRESTED BUTTE ──
  { resort_name: 'Crested Butte', name: 'North Face', official_difficulty: 'double_black', lift: 'High Lift', vertical_drop: 1300, length_ft: 4800, average_pitch: 42, max_pitch: 58, groomed: false, description: 'Extreme steep glades' },
  { resort_name: 'Crested Butte', name: 'Rambo', official_difficulty: 'double_black', lift: 'High Lift', vertical_drop: 1100, length_ft: 4200, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Classic expert double black' },
  { resort_name: 'Crested Butte', name: 'Teocalli Bowl', official_difficulty: 'black', lift: 'Silver Queen Gondola', vertical_drop: 1400, length_ft: 6000, average_pitch: 30, max_pitch: 44, groomed: false, description: 'Huge off-piste bowl' },
  { resort_name: 'Crested Butte', name: 'Keystone', official_difficulty: 'blue', lift: 'Keystone Lift', vertical_drop: 1000, length_ft: 6800, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Classic cruiser' },

  // ── SCHWEITZER ──
  { resort_name: 'Schweitzer', name: 'The Promised Land', official_difficulty: 'double_black', lift: 'Great Escape Quad', vertical_drop: 1200, length_ft: 4600, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Backcountry-style expert terrain' },
  { resort_name: 'Schweitzer', name: 'Stiles', official_difficulty: 'blue', lift: 'Basin Express', vertical_drop: 1300, length_ft: 8200, average_pitch: 18, max_pitch: 28, groomed: true, description: 'Wide groomed cruiser' },
  { resort_name: 'Schweitzer', name: 'Rondeau', official_difficulty: 'green', lift: 'Chair 1', vertical_drop: 800, length_ft: 7400, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Beginner run with lake views' },

  // ── STRATTON ──
  { resort_name: 'Stratton', name: 'Upper Tamarack', official_difficulty: 'double_black', lift: 'Shooting Star Quad', vertical_drop: 900, length_ft: 3600, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Steep expert mogul run' },
  { resort_name: 'Stratton', name: 'Black Bear', official_difficulty: 'black', lift: 'Upper Gondola', vertical_drop: 1000, length_ft: 5000, average_pitch: 28, max_pitch: 42, groomed: false, description: 'Classic Vermont black' },
  { resort_name: 'Stratton', name: 'Standard', official_difficulty: 'blue', lift: 'Gondola', vertical_drop: 1400, length_ft: 8600, average_pitch: 16, max_pitch: 24, groomed: true, description: 'Main intermediate groomer' },

  // ── SUGARBUSH ──
  { resort_name: 'Sugarbush', name: 'Castlerock', official_difficulty: 'double_black', lift: 'Castlerock Lift', vertical_drop: 1100, length_ft: 4200, average_pitch: 40, max_pitch: 56, groomed: false, description: 'Legendary steep double black' },
  { resort_name: 'Sugarbush', name: 'Stein\'s Run', official_difficulty: 'blue', lift: 'Gate House Lift', vertical_drop: 1300, length_ft: 7800, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Classic cruiser' },
  { resort_name: 'Sugarbush', name: 'Easy Rider', official_difficulty: 'green', lift: 'Easy Rider Lift', vertical_drop: 700, length_ft: 6500, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Gentle beginner run' },

  // ── SUN VALLEY ──
  { resort_name: 'Sun Valley', name: 'Exhibition', official_difficulty: 'double_black', lift: 'Exhibition Express', vertical_drop: 1500, length_ft: 5500, average_pitch: 38, max_pitch: 52, groomed: false, description: 'Famous race course and mogul venue' },
  { resort_name: 'Sun Valley', name: 'Limelight', official_difficulty: 'black', lift: 'Challenger Express', vertical_drop: 1200, length_ft: 5000, average_pitch: 28, max_pitch: 40, groomed: false, description: 'Classic steep on Baldy' },
  { resort_name: 'Sun Valley', name: 'Cozy', official_difficulty: 'green', lift: 'Dollar Mountain', vertical_drop: 600, length_ft: 5500, average_pitch: 9, max_pitch: 14, groomed: true, description: 'Dollar Mountain beginner terrain' },
  { resort_name: 'Sun Valley', name: 'Greyhawk', official_difficulty: 'blue', lift: 'Frenchman\'s Express', vertical_drop: 1400, length_ft: 8500, average_pitch: 17, max_pitch: 26, groomed: true, description: 'Wide groomed cruiser on Baldy' },
];