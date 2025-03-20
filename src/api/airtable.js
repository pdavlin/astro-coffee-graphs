import Airtable from 'airtable';

// Helper function to check if the environment variables are set
function checkEnvVars() {
  const apiKey = import.meta.env.AIRTABLE_API_KEY;
  const baseId = import.meta.env.AIRTABLE_BASE_ID;
  
  if (!apiKey || apiKey === 'undefined') {
    throw new Error('AIRTABLE_API_KEY is missing in environment variables');
  }
  
  if (!baseId || baseId === 'undefined') {
    throw new Error('AIRTABLE_BASE_ID is missing in environment variables');
  }
  
  return { apiKey, baseId };
}

// Configure Airtable
export async function fetchRecords(tableName) {
  try {
    // Validate environment variables
    const { apiKey, baseId } = checkEnvVars();
    
    console.log(`Connecting to Airtable with Base ID: ${baseId} and table: ${tableName}`);
    
    const base = new Airtable({ apiKey }).base(baseId);
    
    const records = await base(tableName).select().all();
    console.log(`Successfully fetched ${records.length} records from ${tableName}`);
    
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    
    // Provide more detailed error information
    if (error.statusCode === 404) {
      console.error('404 Not Found: This could mean your Base ID is incorrect or the table does not exist');
    } else if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('Authentication error: Your API key might be invalid or expired');
    }
    
    // Return empty array with a defined structure to prevent UI errors
    return [];
  }
}