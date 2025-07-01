import { fetchRecords } from "../../api/airtable.js";

export async function GET() {
  try {
    // Fetch all tables to debug
    const [shots, coffeeBags, roasters] = await Promise.all([
      fetchRecords("Shots"),
      fetchRecords("Coffee Bags"),
      fetchRecords("Roasters")
    ]);

    // Get the first few records from each table for debugging
    const debugData = {
      shots: {
        total: shots.length,
        sample: shots.slice(0, 3).map(record => ({
          id: record.id,
          coffeeBag: record["Coffee Bag"],
          barista: record["Barista"] || record["barista"],
          startTime: record["Start time"]
        }))
      },
      coffeeBags: {
        total: coffeeBags.length,
        sample: coffeeBags.slice(0, 5).map(record => ({
          id: record.id,
          name: record.Name || record.name,
          roaster: record.Roaster || record.roaster,
          allFields: Object.keys(record)
        }))
      },
      roasters: {
        total: roasters.length,
        sample: roasters.slice(0, 5).map(record => ({
          id: record.id,
          name: record.Name || record.name,
          ID: record.ID,
          allFields: Object.keys(record)
        }))
      }
    };

    return new Response(JSON.stringify(debugData, null, 2), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
