// import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function TMLlogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-pink-500`}
    >
      <p className="text-[40px]">The Mommy Lounge</p>
      {/* <ChatBubbleLeftEllipsisIcon className="h-12 w-12" /> */}
    </div>
  );
}