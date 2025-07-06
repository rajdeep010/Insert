import React, { useEffect, useState, ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/app/context/UserProvider";

interface InsertHoverCardProps {
  trigger: ReactNode;
  username: string;
  name?: string;
  description?: string;
}

const InsertHoverCard: React.FC<InsertHoverCardProps> = ({
  trigger,
  username,
  name,
  description,
}) => {
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const { getAvatar } = useUser();

  useEffect(() => {
    const collectURL = async () => {
      try {
        const response = await getAvatar(username);
        setAvatarURL(response);
      } catch {
        setAvatarURL(null);
      }
    };
    collectURL();
  }, [username, getAvatar]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between gap-4">
          <Avatar>
            <AvatarImage src={avatarURL || ""} />
            <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{name || username}</h4>
            <p className="text-xs text-slate-500 truncate">@{username}</p>
            {description && (
              <p className="text-sm line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default InsertHoverCard;