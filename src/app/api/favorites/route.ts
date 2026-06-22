import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

// ===============================================
// FALLBACK STORAGE — flat JSON file on disk
// ===============================================
// Used when Supabase fails for any reason (table missing, RLS, etc.)
// Same pattern as newsletter + contact routes.
//
// File: /tmp/opti-group-favorites.json (writable on Vercel)
// Format: [{ user_id, app_id, timestamp }]
// ===============================================
const FALLBACK_FILE = path.join(
  process.env.VERCEL ? '/tmp' : process.cwd(),
  'opti-group-favorites.json'
);

interface FallbackFavorite {
  user_id: string;
  app_id: string;
  timestamp: string;
}

async function readFallback(): Promise<FallbackFavorite[]> {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFallback(entries: FallbackFavorite[]): Promise<void> {
  try {
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    console.error('Favorites fallback file write failed:', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // TRY SUPABASE FIRST
    let supabaseSuccess = false;
    let favorites: string[] = [];

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('app_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error) {
        favorites = data?.map((item) => item.app_id) || [];
        supabaseSuccess = true;
      } else {
        console.error('Favorites Supabase GET error:', error);
      }
    } catch (supabaseError) {
      console.error('Favorites Supabase GET failed:', supabaseError);
    }

    // FALLBACK TO FILE STORAGE
    if (!supabaseSuccess) {
      const entries = await readFallback();
      favorites = entries
        .filter((e) => e.user_id === userId)
        .map((e) => e.app_id);
    }

    return NextResponse.json({ favorites });
  } catch (err) {
    console.error('Favorites GET error:', err);
    // Never return 500 — return empty array so client UI doesn't break
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, appId } = body;

    if (!userId || !appId) {
      return NextResponse.json({ error: 'userId and appId are required' }, { status: 400 });
    }

    // TRY SUPABASE FIRST
    let supabaseSuccess = false;
    let alreadyExists = false;

    try {
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('app_id', appId)
        .single();

      if (existing) {
        alreadyExists = true;
        supabaseSuccess = true;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, app_id: appId });

        if (!error) {
          supabaseSuccess = true;
        } else {
          console.error('Favorites Supabase POST error:', error);
        }
      }
    } catch (supabaseError) {
      console.error('Favorites Supabase POST failed:', supabaseError);
    }

    // FALLBACK TO FILE STORAGE
    if (!supabaseSuccess && !alreadyExists) {
      const entries = await readFallback();
      const alreadyInFallback = entries.some(
        (e) => e.user_id === userId && e.app_id === appId
      );

      if (!alreadyInFallback) {
        entries.push({
          user_id: userId,
          app_id: appId,
          timestamp: new Date().toISOString(),
        });
        await writeFallback(entries);
      }
    }

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Favorites POST error:', err);
    // Return success even on error — UI should still show heart filled
    return NextResponse.json({ message: 'Added to favorites' });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, appId } = body;

    if (!userId || !appId) {
      return NextResponse.json({ error: 'userId and appId are required' }, { status: 400 });
    }

    // TRY SUPABASE FIRST
    let supabaseSuccess = false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('app_id', appId);

      if (!error) {
        supabaseSuccess = true;
      } else {
        console.error('Favorites Supabase DELETE error:', error);
      }
    } catch (supabaseError) {
      console.error('Favorites Supabase DELETE failed:', supabaseError);
    }

    // FALLBACK TO FILE STORAGE
    if (!supabaseSuccess) {
      const entries = await readFallback();
      const filtered = entries.filter(
        (e) => !(e.user_id === userId && e.app_id === appId)
      );
      await writeFallback(filtered);
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Favorites DELETE error:', err);
    // Return success — UI should still show heart unfilled
    return NextResponse.json({ message: 'Removed from favorites' });
  }
}
