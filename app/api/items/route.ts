import {NextResponse} from 'next/server';
import {initialItems} from '../../../lib/pantry';
// DEMO ONLY: stateless seed response. Replace with authenticated database access in Phase 2.
export async function GET(){return NextResponse.json({items:initialItems, nextCursor:null});}
