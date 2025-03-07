// src/lib/api-utils.ts
import { NextResponse } from 'next/server';

/**
 * Standardowa obsługa błędów API
 */
export function handleApiError(error: unknown, message: string = "Wystąpił błąd") {
  console.error(`API Error: ${message}`, error);
  
  return NextResponse.json(
    { 
      error: message, 
      details: error instanceof Error ? error.message : String(error) 
    },
    { status: 500 }
  );
}

/**
 * Standardowa odpowiedź dla nieautoryzowanych żądań
 */
export function unauthorizedResponse(message: string = "Brak autoryzacji") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Dodaje nagłówki CORS do response
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return response;
}

/**
 * Standardowa odpowiedź dla OPTIONS
 */
export function corsOptionsResponse() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  });
}