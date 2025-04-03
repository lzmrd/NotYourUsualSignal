import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Call your Python backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await axios.get(`${apiUrl}/api/analyze`);
    
    // Return the response from your Python backend
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error calling analyze API:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run analysis. Please check if the backend server is running.' 
      },
      { status: 500 }
    );
  }
}
