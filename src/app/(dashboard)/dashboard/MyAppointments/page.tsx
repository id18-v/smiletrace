import requireUser from "@/hooks/session"
export default async function Dashboard() {
  const session = await requireUser()
  // await emailService.sendAppointmentReminder('cmez8yn4x000199nowobmegxq'); 
  return ( <>
    
    <div>

    </div>
  </>
  );
}

