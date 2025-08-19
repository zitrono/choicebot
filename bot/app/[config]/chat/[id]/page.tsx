import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/app/auth-stub";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries-stub";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({ params }: { params: { config: string; id: string } }) {
  const { id, config } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting and converting messages to UI messages
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return <PreviewChat id={chat.id} initialMessages={chat.messages} configId={config} />;
}
