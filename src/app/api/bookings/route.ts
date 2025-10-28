import { NextResponse } from 'next/server';

export async function GET() {
  const CALCOM_API_KEY = process.env.CALCOM_API_KEY;
  
  if (!CALCOM_API_KEY) {
    return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.cal.com/v2/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CALCOM_API_KEY}`,
        'cal-api-version': '2024-08-13',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      //console.error('Cal.com API error:', response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transformă datele în formatul nostru
    const bookings = data.data.map((booking: any) => ({
      id: booking.id,
      uid: booking.uid,
      title: booking.title,
      description: booking.description || '',
      startTime: booking.start,
      endTime: booking.end,
      status: booking.status,
      attendeeName: booking.attendees?.[0]?.name || 'N/A',
      attendeeEmail: booking.attendees?.[0]?.email || 'N/A',
      attendeeTimeZone: booking.attendees?.[0]?.timeZone || '',
      location: booking.location || '',
      createdAt: booking.createdAt,
      rescheduled: booking.rescheduled || false,
    }));

    // Filtrează doar bookings viitoare
    const now = new Date();
    const upcomingBookings = bookings.filter((booking: any) => {
      const startTime = new Date(booking.startTime);
      return startTime >= now && booking.status !== 'cancelled';
    });

    return NextResponse.json({ 
      bookings: upcomingBookings,
      total: upcomingBookings.length,
      allBookings: bookings.length
    });

  } catch (error) {
   // console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}