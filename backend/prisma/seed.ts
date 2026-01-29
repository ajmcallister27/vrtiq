import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = {
  "resorts": [
    {
      "id": "6976c792e986d5d3b3f18bc4",
      "name": "Crystal Mountain ",
      "location": "Enumclaw, WA",
      "country": "United States",
      "latitude": 47.0206,
      "longitude": -121.6025,
      "website": "https://www.crystalmountainresort.com",
      "verticalDrop": 3100,
      "baseElevation": 4400,
      "peakElevation": 7012,
      "mapImageUrl": null,
      "createdBy": "anonymous"
    },
    {
      "id": "6974faca3dfaeecac9f7c909",
      "name": "Summit at Snoqualmie-Central",
      "location": "Snoqualmie Pass, Washington ",
      "country": "USA ",
      "latitude": null,
      "longitude": null,
      "website": null,
      "verticalDrop": null,
      "baseElevation": null,
      "peakElevation": null,
      "mapImageUrl": null,
      "createdBy": "anonymous"
    },
    {
      "id": "697199f845f576ab924ed20a",
      "name": "Summit at Snoqualmie-West ",
      "location": "Snoqualmie Pass, Washington ",
      "country": "USA ",
      "latitude": null,
      "longitude": null,
      "website": null,
      "verticalDrop": null,
      "baseElevation": null,
      "peakElevation": null,
      "mapImageUrl": null,
      "createdBy": "anonymous"
    },
    {
      "id": "6971130f7f091893d19228bd",
      "name": "Alpental",
      "location": "Snoqualmie Pass, Washington",
      "country": "USA",
      "latitude": 47.44,
      "longitude": 121.43,
      "website": "https://www.summitatsnoqualmie.com/alpental",
      "verticalDrop": 2280,
      "baseElevation": 3140,
      "peakElevation": 5420,
      "mapImageUrl": "https://cdn.sanity.io/files/8ts88bij/summit/18cee64e6a6d6947eab0e4c979893ea393e34408.jpg",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971100d3c5395fcb10c2541",
      "name": "Park City",
      "location": "Park City, UT",
      "country": "USA",
      "latitude": 40.6514,
      "longitude": -111.508,
      "website": "https://www.parkcitymountain.com",
      "verticalDrop": 3226,
      "baseElevation": 6900,
      "peakElevation": 10026,
      "mapImageUrl": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971100d3c5395fcb10c2542",
      "name": "Jackson Hole",
      "location": "Teton Village, WY",
      "country": "USA",
      "latitude": 43.5875,
      "longitude": -110.8279,
      "website": "https://www.jacksonhole.com",
      "verticalDrop": 4139,
      "baseElevation": 6311,
      "peakElevation": 10450,
      "mapImageUrl": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971100d3c5395fcb10c2540",
      "name": "Vail",
      "location": "Vail, CO",
      "country": "USA",
      "latitude": 39.6403,
      "longitude": -106.3742,
      "website": "https://www.vail.com",
      "verticalDrop": 3450,
      "baseElevation": 8120,
      "peakElevation": 11570,
      "mapImageUrl": null,
      "createdBy": "ajmcallister27@gmail.com"
    }
  ],
  "runs": [
    {
      "id": "6976c7dbd192f06317b1944a",
      "name": "Julies Right ",
      "resortId": "697199f845f576ab924ed20a",
      "officialDifficulty": "green",
      "lift": "Julie's",
      "lengthFt": null,
      "verticalDrop": 765,
      "averagePitch": 18.3,
      "maxPitch": 18.3,
      "groomed": true,
      "description": "Julie's is a green run at Summit West, known for its gentle slopes and family-friendly terrain.",
      "createdBy": "anonymous"
    },
    {
      "id": "697676bc4bc467ae1d3bdc62",
      "name": "Sessel",
      "resortId": "6971130f7f091893d19228bd",
      "officialDifficulty": "blue",
      "lift": "Sessel Chair",
      "lengthFt": null,
      "verticalDrop": 590,
      "averagePitch": 16.9,
      "maxPitch": 16.9,
      "groomed": true,
      "description": "The Sessel Chair is a fixed-grip triple chairlift at Alpental, providing access to intermediate terrain with a vertical drop of 590 feet and an average pitch of 16.9 degrees.",
      "createdBy": "anonymous"
    },
    {
      "id": "6974faf26c54602961995845",
      "name": "Holiday",
      "resortId": "6974faca3dfaeecac9f7c909",
      "officialDifficulty": "green",
      "lift": "Holiday ",
      "lengthFt": null,
      "verticalDrop": null,
      "averagePitch": null,
      "maxPitch": null,
      "groomed": true,
      "description": null,
      "createdBy": "anonymous"
    },
    {
      "id": "69719a101d3cb6330ef9a2fd",
      "name": "Little Thunder",
      "resortId": "697199f845f576ab924ed20a",
      "officialDifficulty": "green",
      "lift": "Little Thunder ",
      "lengthFt": null,
      "verticalDrop": null,
      "averagePitch": null,
      "maxPitch": null,
      "groomed": true,
      "description": null,
      "createdBy": "anonymous"
    },
    {
      "id": "6971133eceb1bf305ab3e3b1",
      "name": "St. Bernard Right",
      "resortId": "6971130f7f091893d19228bd",
      "officialDifficulty": "green",
      "lift": "St. Bernard Chairlift",
      "lengthFt": null,
      "verticalDrop": 771,
      "averagePitch": 15.3,
      "maxPitch": null,
      "groomed": true,
      "description": "St. Bernard is the only beginner trail at Alpental, accessible via the St. Bernard Chairlift or the Magic Carpet surface lift. It offers a gentle slope suitable for novice skiers.",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c254e",
      "name": "Born Free",
      "resortId": "6971100d3c5395fcb10c2540",
      "officialDifficulty": "green",
      "lift": "Avanti Express",
      "lengthFt": null,
      "verticalDrop": 1100,
      "averagePitch": 12,
      "maxPitch": null,
      "groomed": true,
      "description": "Perfect beginner cruiser",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2554",
      "name": "Amphitheater",
      "resortId": "6971100d3c5395fcb10c2542",
      "officialDifficulty": "blue",
      "lift": "Apres Vous",
      "lengthFt": null,
      "verticalDrop": 1500,
      "averagePitch": 22,
      "maxPitch": null,
      "groomed": true,
      "description": "Scenic intermediate run with great views",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2551",
      "name": "McConkey's",
      "resortId": "6971100d3c5395fcb10c2541",
      "officialDifficulty": "double_black",
      "lift": "McConkey's",
      "lengthFt": null,
      "verticalDrop": 600,
      "averagePitch": 40,
      "maxPitch": 50,
      "groomed": false,
      "description": "Legendary steep chute",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c254b",
      "name": "Riva Ridge",
      "resortId": "6971100d3c5395fcb10c2540",
      "officialDifficulty": "blue",
      "lift": "Chair 4",
      "lengthFt": null,
      "verticalDrop": 2300,
      "averagePitch": 18,
      "maxPitch": null,
      "groomed": true,
      "description": "Classic intermediate cruiser, one of Vail's most iconic runs",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c254c",
      "name": "Blue Sky Basin - Lover's Leap",
      "resortId": "6971100d3c5395fcb10c2540",
      "officialDifficulty": "black",
      "lift": "Skyline Express",
      "lengthFt": null,
      "verticalDrop": 1200,
      "averagePitch": 28,
      "maxPitch": null,
      "groomed": false,
      "description": "Open bowl skiing with great views",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2550",
      "name": "Jupiter Bowl",
      "resortId": "6971100d3c5395fcb10c2541",
      "officialDifficulty": "black",
      "lift": "Jupiter Lift",
      "lengthFt": null,
      "verticalDrop": 1400,
      "averagePitch": 32,
      "maxPitch": null,
      "groomed": false,
      "description": "Steep bowl with variable conditions",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c254d",
      "name": "Prima Cornice",
      "resortId": "6971100d3c5395fcb10c2540",
      "officialDifficulty": "double_black",
      "lift": "Chair 5",
      "lengthFt": null,
      "verticalDrop": 800,
      "averagePitch": 38,
      "maxPitch": 45,
      "groomed": false,
      "description": "Steep mogul run, expert only",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2553",
      "name": "Rendezvous Bowl",
      "resortId": "6971100d3c5395fcb10c2542",
      "officialDifficulty": "black",
      "lift": "Aerial Tram",
      "lengthFt": null,
      "verticalDrop": 2000,
      "averagePitch": 30,
      "maxPitch": null,
      "groomed": false,
      "description": "Wide open expert bowl skiing",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c254f",
      "name": "PayDay",
      "resortId": "6971100d3c5395fcb10c2541",
      "officialDifficulty": "blue",
      "lift": "PayDay",
      "lengthFt": null,
      "verticalDrop": 1800,
      "averagePitch": 20,
      "maxPitch": null,
      "groomed": true,
      "description": "Wide groomer, great for intermediates",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2555",
      "name": "Pooh Bear",
      "resortId": "6971100d3c5395fcb10c2542",
      "officialDifficulty": "green",
      "lift": "Teewinot",
      "lengthFt": null,
      "verticalDrop": 600,
      "averagePitch": 10,
      "maxPitch": null,
      "groomed": true,
      "description": "Gentle beginner slope",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697110243c5395fcb10c2552",
      "name": "Corbet's Couloir",
      "resortId": "6971100d3c5395fcb10c2542",
      "officialDifficulty": "double_black",
      "lift": "Aerial Tram",
      "lengthFt": null,
      "verticalDrop": 500,
      "averagePitch": 45,
      "maxPitch": 55,
      "groomed": false,
      "description": "The most famous expert run in North America",
      "createdBy": "ajmcallister27@gmail.com"
    }
  ],
  "ratings": [
    {
      "id": "697a5f472fa048dd94872af6",
      "runId": "6976c7dbd192f06317b1944a",
      "rating": 2,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "6976c7e71562af1f0e373f21",
      "runId": "6976c7dbd192f06317b1944a",
      "rating": 2,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "697676ce13e992e0a6c4225d",
      "runId": "697676bc4bc467ae1d3bdc62",
      "rating": 5,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "6975dd46995925365eacfae4",
      "runId": "697110243c5395fcb10c254f",
      "rating": 10,
      "skillLevel": "beginner",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6974fb188bc23c5e4193f8d7",
      "runId": "6974faf26c54602961995845",
      "rating": 1,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "697248edc713de2e804e51ff",
      "runId": "697110243c5395fcb10c254e",
      "rating": 10,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "69719a409e4e65b765582df0",
      "runId": "69719a101d3cb6330ef9a2fd",
      "rating": 1,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "69713dd6bb9f6597016c22a6",
      "runId": "6971133eceb1bf305ab3e3b1",
      "rating": 2,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "anonymous"
    },
    {
      "id": "697118433153c1335f8428c0",
      "runId": "6971133eceb1bf305ab3e3b1",
      "rating": 2,
      "skillLevel": "advanced",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697112392a12e43dffc00a9e",
      "runId": "697110243c5395fcb10c254f",
      "rating": 1,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971123477d8ba2b41f3b9c7",
      "runId": "697110243c5395fcb10c254f",
      "rating": 2,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971122ffcdaf403df5b683d",
      "runId": "697110243c5395fcb10c254f",
      "rating": 3,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697112250db93b64d5ccb2c5",
      "runId": "697110243c5395fcb10c254f",
      "rating": 3,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697111eb1a8602cd87d8efcb",
      "runId": "697110243c5395fcb10c254f",
      "rating": 8,
      "skillLevel": "beginner",
      "conditions": "icy",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697111119eef0a4e0265962f",
      "runId": "697110243c5395fcb10c254e",
      "rating": 5,
      "skillLevel": "beginner",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2569",
      "runId": "697110243c5395fcb10c2553",
      "rating": 8,
      "skillLevel": "advanced",
      "conditions": "powder",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2563",
      "runId": "697110243c5395fcb10c254d",
      "rating": 8,
      "skillLevel": "expert",
      "conditions": "powder",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2561",
      "runId": "697110243c5395fcb10c254c",
      "rating": 6,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2566",
      "runId": "697110243c5395fcb10c2552",
      "rating": 9,
      "skillLevel": "expert",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2565",
      "runId": "697110243c5395fcb10c2552",
      "rating": 10,
      "skillLevel": "expert",
      "conditions": "powder",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2564",
      "runId": "697110243c5395fcb10c2552",
      "rating": 10,
      "skillLevel": "expert",
      "conditions": "variable",
      "comment": "The drop-in is no joke",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c255f",
      "runId": "697110243c5395fcb10c254b",
      "rating": 3,
      "skillLevel": "expert",
      "conditions": "powder",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2560",
      "runId": "697110243c5395fcb10c254c",
      "rating": 7,
      "skillLevel": "advanced",
      "conditions": "powder",
      "comment": "Steep with great snow",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c255d",
      "runId": "697110243c5395fcb10c254b",
      "rating": 4,
      "skillLevel": "intermediate",
      "conditions": "groomed",
      "comment": "Classic blue, perfect for warming up",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2562",
      "runId": "697110243c5395fcb10c254d",
      "rating": 9,
      "skillLevel": "expert",
      "conditions": "icy",
      "comment": "Legitimately terrifying when icy",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2567",
      "runId": "697110243c5395fcb10c254f",
      "rating": 4,
      "skillLevel": "intermediate",
      "conditions": "groomed",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c2568",
      "runId": "697110243c5395fcb10c2550",
      "rating": 7,
      "skillLevel": "advanced",
      "conditions": "variable",
      "comment": null,
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c255e",
      "runId": "697110243c5395fcb10c254b",
      "rating": 5,
      "skillLevel": "advanced",
      "conditions": "icy",
      "comment": "Gets challenging when icy",
      "createdBy": "ajmcallister27@gmail.com"
    }
  ],
  "notes": [
    {
      "id": "6974f833b2874b2e67d42711",
      "runId": "6971133eceb1bf305ab3e3b1",
      "note": "trees, moguls, powder",
      "tags": [
        "trees",
        "moguls",
        "powder"
      ],
      "dateObserved": "2026-01-24T00:00:00.000Z",
      "createdBy": "anonymous"
    },
    {
      "id": "69719a355c5df6a7894267fd",
      "runId": "69719a101d3cb6330ef9a2fd",
      "note": "crowded, exposed, flat",
      "tags": [
        "crowded",
        "exposed",
        "flat"
      ],
      "dateObserved": "2026-01-22T00:00:00.000Z",
      "createdBy": "anonymous"
    },
    {
      "id": "69711a903153c1335f842a2f",
      "runId": "6971133eceb1bf305ab3e3b1",
      "note": "steep, icy, trees, crowded",
      "tags": [
        "steep",
        "icy",
        "trees",
        "crowded"
      ],
      "dateObserved": "2026-01-21T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "69711a7e0554779035a69cc2",
      "runId": "6971133eceb1bf305ab3e3b1",
      "note": "icy, moguls, windy",
      "tags": [
        "icy",
        "moguls",
        "windy"
      ],
      "dateObserved": "2026-01-21T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256a",
      "runId": "697110243c5395fcb10c254d",
      "note": "Heavy moguls building up on skier's right. Stick to the left for a smoother line.",
      "tags": [
        "moguls",
        "steep"
      ],
      "dateObserved": "2024-02-15T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256d",
      "runId": "697110243c5395fcb10c2550",
      "note": "Wind-affected snow, variable conditions throughout. Watch for ice patches.",
      "tags": [
        "icy",
        "windy",
        "exposed"
      ],
      "dateObserved": "2024-02-01T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256b",
      "runId": "697110243c5395fcb10c2552",
      "note": "The mandatory air is 10-15 feet depending on snow depth. Not for beginners.",
      "tags": [
        "steep",
        "exposed"
      ],
      "dateObserved": "2024-01-20T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256c",
      "runId": "697110243c5395fcb10c254b",
      "note": "Gets crowded after 10am. Hit it early for the best experience.",
      "tags": [
        "crowded"
      ],
      "dateObserved": "2024-02-10T00:00:00.000Z",
      "createdBy": "ajmcallister27@gmail.com"
    }
  ],
  "comparisons": [
    {
      "id": "697a5f35664e7cee4a0a2dba",
      "run1Id": "6976c7dbd192f06317b1944a",
      "run2Id": "6974faf26c54602961995845",
      "comparisonType": "harder",
      "note": "Julies Right  is harder than Holiday",
      "createdBy": "anonymous"
    },
    {
      "id": "6976c7fd1562beb415617bb0",
      "run1Id": "6976c7dbd192f06317b1944a",
      "run2Id": "6971133eceb1bf305ab3e3b1",
      "comparisonType": "similar",
      "note": "Julies Right  is similar to St. Bernard Right",
      "createdBy": "anonymous"
    },
    {
      "id": "697676f669194114376dc1d2",
      "run1Id": "697676bc4bc467ae1d3bdc62",
      "run2Id": "697110243c5395fcb10c254f",
      "comparisonType": "harder",
      "note": "Sessel is harder than PayDay",
      "createdBy": "anonymous"
    },
    {
      "id": "697676f4cac53fe72389a5a5",
      "run1Id": "697110243c5395fcb10c254b",
      "run2Id": "6971133eceb1bf305ab3e3b1",
      "comparisonType": "harder",
      "note": "Riva Ridge is harder than St. Bernard Right",
      "createdBy": "anonymous"
    },
    {
      "id": "697676f21afab791a27eab22",
      "run1Id": "697110243c5395fcb10c2550",
      "run2Id": "697676bc4bc467ae1d3bdc62",
      "comparisonType": "harder",
      "note": "Jupiter Bowl is harder than Sessel",
      "createdBy": "anonymous"
    },
    {
      "id": "697676f009cde90351a1c1d9",
      "run1Id": "697676bc4bc467ae1d3bdc62",
      "run2Id": "697110243c5395fcb10c254b",
      "comparisonType": "harder",
      "note": "Sessel is harder than Riva Ridge",
      "createdBy": "anonymous"
    },
    {
      "id": "697676ef2dae2f459b2dd0c6",
      "run1Id": "697110243c5395fcb10c254c",
      "run2Id": "697110243c5395fcb10c2550",
      "comparisonType": "harder",
      "note": "Blue Sky Basin - Lover's Leap is harder than Jupiter Bowl",
      "createdBy": "anonymous"
    },
    {
      "id": "697676ed0806782a8158511f",
      "run1Id": "697110243c5395fcb10c254d",
      "run2Id": "697110243c5395fcb10c2553",
      "comparisonType": "harder",
      "note": "Prima Cornice is harder than Rendezvous Bowl",
      "createdBy": "anonymous"
    },
    {
      "id": "697676ea998b5a4f587b4fca",
      "run1Id": "697110243c5395fcb10c2550",
      "run2Id": "697110243c5395fcb10c254e",
      "comparisonType": "harder",
      "note": "Jupiter Bowl is harder than Born Free",
      "createdBy": "anonymous"
    },
    {
      "id": "697676618f9f5eef5f5e24cc",
      "run1Id": "6971133eceb1bf305ab3e3b1",
      "run2Id": "69719a101d3cb6330ef9a2fd",
      "comparisonType": "harder",
      "note": "St. Bernard Right is harder than Little Thunder",
      "createdBy": "anonymous"
    },
    {
      "id": "6975dd2b454875bbe9eca2d3",
      "run1Id": "6974faf26c54602961995845",
      "run2Id": "69719a101d3cb6330ef9a2fd",
      "comparisonType": "harder",
      "note": "Holiday is harder than Little Thunder",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "697113afe85146c991ce2451",
      "run1Id": "6971133eceb1bf305ab3e3b1",
      "run2Id": "697110243c5395fcb10c254f",
      "comparisonType": "easier",
      "note": "St. Bernard Right is easier than PayDay",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256e",
      "run1Id": "697110243c5395fcb10c2552",
      "run2Id": "697110243c5395fcb10c254d",
      "comparisonType": "harder",
      "note": "Corbet's is significantly harder than Prima Cornice - the mandatory air and steeper entry make it expert-only",
      "createdBy": "ajmcallister27@gmail.com"
    },
    {
      "id": "6971103c3c5395fcb10c256f",
      "run1Id": "697110243c5395fcb10c254b",
      "run2Id": "697110243c5395fcb10c254f",
      "comparisonType": "similar",
      "note": "Riva Ridge and PayDay are similar intermediate cruisers, both great warm-up runs",
      "createdBy": "ajmcallister27@gmail.com"
    }
  ]
};

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.crossResortComparison.deleteMany();
  await prisma.conditionNote.deleteMany();
  await prisma.difficultyRating.deleteMany();
  await prisma.run.deleteMany();
  await prisma.resort.deleteMany();

  // Seed resorts
  for (const resort of seedData.resorts) {
    await prisma.resort.create({ data: resort });
  }
  console.log(`Created ${seedData.resorts.length} resorts`);

  // Seed runs
  for (const run of seedData.runs) {
    await prisma.run.create({ data: run });
  }
  console.log(`Created ${seedData.runs.length} runs`);

  // Seed ratings
  for (const rating of seedData.ratings) {
    await prisma.difficultyRating.create({ data: rating });
  }
  console.log(`Created ${seedData.ratings.length} ratings`);

  // Seed notes
  for (const note of seedData.notes) {
    await prisma.conditionNote.create({
      data: {
        ...note,
        dateObserved: note.dateObserved ? new Date(note.dateObserved) : null
      }
    });
  }
  console.log(`Created ${seedData.notes.length} condition notes`);

  // Seed comparisons
  for (const comparison of seedData.comparisons) {
    await prisma.crossResortComparison.create({ data: comparison });
  }
  console.log(`Created ${seedData.comparisons.length} comparisons`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
