import SideNav from '@/app/ui/home/sidenav';


export default function Home() {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="w-full flex-none md:w-64">
            <SideNav />
          </div>
    <main className="flex min-h-screen flex-col p-6">
      
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-3/5 md:px-20">
          <div className={`text-xl text-gray-800 md:text-3xl md:leading-normal space-y-4`}>
            <h3><strong>Welcome to The Mommy Lounge! </strong></h3> 
            <p>The Mommy Lounge is a website where moms can ask and share tips, 
            ideas, stories, and activities while building a sense of 
            community with other moms. </p>
            <p>Sign in to participate!</p>
          </div>
          
        </div>
      </div>

    </main>
   </div>
    
      
  );
}
