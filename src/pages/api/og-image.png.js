import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { fetchRecords } from "../../api/airtable.js";
import fs from "fs/promises";
import path from "path";

// Cache for coffee bag names and roaster names
const coffeeBagCache = new Map();
const roasterCache = new Map();

// Font data will be loaded once and cached
let fontData;

async function loadFont() {
  if (fontData) return fontData;

  // Use local Berkeley Mono font
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "BerkeleyMono-Regular.otf",
  );
  const fontBuffer = await fs.readFile(fontPath);
  fontData = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength,
  );
  return fontData;
}

// Helper function to filter out Matt McCrary's shots
function filterRecords(records) {
  if (!records || records.length === 0) return records;

  return records.filter((record) => {
    const barista =
      record["Barista"] ||
      record["barista"] ||
      record["Made by"] ||
      record["made by"] ||
      "";
    const baristaStr = String(barista).toLowerCase();
    return (
      !baristaStr.includes("matt mccrary") && !baristaStr.includes("mccrary")
    );
  });
}

// Get roaster name from Airtable ID
async function getRoasterName(roasterId) {
  if (!roasterId) return "";

  // Handle array of IDs (linked records)
  const id = Array.isArray(roasterId) ? roasterId[0] : roasterId;
  if (!id) return "";

  // Check cache first
  if (roasterCache.has(id)) {
    return roasterCache.get(id);
  }

  try {
    // Fetch from Roasters table
    const roasters = await fetchRecords("Roasters");

    // Build cache using both Airtable record id and custom ID field
    roasters.forEach((roaster) => {
      const roasterName = roaster.Name || roaster.name || "";

      // Cache by Airtable record id
      if (roaster.id) {
        roasterCache.set(roaster.id, roasterName);
      }

      // Also cache by custom ID field if it exists
      if (roaster.ID) {
        roasterCache.set(roaster.ID, roasterName);
      }
    });

    return roasterCache.get(id) || "";
  } catch (error) {
    console.error("Error fetching roaster names:", error);
    return "";
  }
}

// Get coffee bag info from Airtable ID
async function getCoffeeBagInfo(bagId) {
  if (!bagId) return null;

  // Check cache first
  if (coffeeBagCache.has(bagId)) {
    return coffeeBagCache.get(bagId);
  }

  try {
    // Fetch from Coffee Bags table
    const bags = await fetchRecords("Coffee Bags");

    // Build cache with name and roaster ID
    bags.forEach((bag) => {
      if (bag.id) {
        const name = bag.Name || bag.name || "Unknown Coffee";
        const roasterId = bag.Roaster || bag.roaster || "";
        coffeeBagCache.set(bag.id, { name, roasterId });
      }
    });

    const bagInfo = coffeeBagCache.get(bagId) || {
      name: "Unknown Coffee",
      roasterId: "",
    };

    // Now fetch the roaster name
    if (bagInfo.roasterId) {
      const roasterName = await getRoasterName(bagInfo.roasterId);
      return { name: bagInfo.name, roaster: roasterName };
    }

    return { name: bagInfo.name, roaster: "" };
  } catch (error) {
    console.error("Error fetching coffee bag info:", error);
    return { name: "Unknown Coffee", roaster: "" };
  }
}

// Get last three different coffee bags
async function getLastThreeCoffeeBags(records) {
  records = filterRecords(records);

  if (!records || records.length === 0) {
    return [];
  }

  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a["Start time"] || 0);
    const dateB = new Date(b["Start time"] || 0);
    return dateB - dateA;
  });

  const uniqueBags = new Map();

  for (const record of sortedRecords) {
    if (uniqueBags.size >= 3) break;

    const coffeeBagField = record["Coffee Bag"];
    if (!coffeeBagField) continue;

    // Handle array of IDs (linked records)
    let bagId;
    if (Array.isArray(coffeeBagField) && coffeeBagField.length > 0) {
      bagId = coffeeBagField[0];
    } else if (typeof coffeeBagField === "string") {
      bagId = coffeeBagField;
    }

    if (bagId && !uniqueBags.has(bagId)) {
      const bagInfo = await getCoffeeBagInfo(bagId);
      if (bagInfo) {
        uniqueBags.set(bagId, bagInfo);
      }
    }
  }

  return Array.from(uniqueBags.values());
}

export async function GET() {
  try {
    // Fetch data
    const records = await fetchRecords("Shots");
    const lastThreeCoffees = await getLastThreeCoffeeBags(records);

    // Load font
    const fontArrayBuffer = await loadFont();

    // Get the daily accent color
    const days = [
      "#ca4949",
      "#b45a3c",
      "#a06e3b",
      "#4b8b8b",
      "#5485b6",
      "#7272ca",
      "#8464c4",
      "#bd5187",
    ];
    const date = new Date().getDate() % 8;
    const accentColor = days[date];

    // Create the JSX structure for the OG image
    const markup = {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          background: "#f4ecec",
          padding: 80,
          boxSizing: "border-box",
          fontFamily: "Berkeley Mono, monospace",
          justifyContent: "space-between",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column" },
              children: {
                type: "h1",
                props: {
                  style: {
                    fontSize: 64,
                    margin: "0 0 60px 0",
                    color: "#1b1818",
                    fontWeight: 700,
                    lineHeight: 1.1,
                  },
                  children: "Patrick's Espresso Shots",
                },
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "center",
                gap: 20,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", flexDirection: "column" },
                    children: {
                      type: "h2",
                      props: {
                        style: {
                          fontSize: 24,
                          color: "#655d5d",
                          margin: "0 0 20px 0",
                          fontWeight: 500,
                        },
                        children: "Recent Coffee Selections:",
                      },
                    },
                  },
                },
                lastThreeCoffees.length > 0
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 24,
                        },
                        children: lastThreeCoffees.map((coffee, index) => ({
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: 20,
                            },
                            children: [
                              {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: 40,
                                    height: 40,
                                    background: accentColor,
                                    color: "#f4ecec",
                                    fontSize: 20,
                                    fontWeight: 700,
                                    borderRadius: "50%",
                                  },
                                  children: String(index + 1),
                                },
                              },
                              {
                                type: "div",
                                props: {
                                  style: {
                                    display: "flex",
                                    fontSize: 32,
                                    color: "#1b1818",
                                    fontWeight: 500,
                                  },
                                  children: coffee.roaster
                                    ? `${coffee.roaster} - ${coffee.name}`
                                    : coffee.name,
                                },
                              },
                            ],
                          },
                        })),
                      },
                    }
                  : {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: 28,
                          color: "#655d5d",
                          fontStyle: "italic",
                        },
                        children: "No coffee data available",
                      },
                    },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: 20,
                      color: "#655d5d",
                    },
                    children: "Coffee Tracking & Analytics",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: 16,
                      color: "#655d5d",
                    },
                    children: new Date().toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    }),
                  },
                },
              ],
            },
          },
        ],
      },
    };

    // Generate SVG using Satori
    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Berkeley Mono",
          data: fontArrayBuffer,
          weight: 400,
          style: "normal",
        },
      ],
    });

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Return the PNG image
    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400", // Cache for 1 hour client, 1 day CDN
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Return a fallback image or error response
    return new Response("Error generating image", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
