"use client";
import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { RiMenu3Line } from "react-icons/ri";
import {
  MessageSquare,
  User,
  FilePenLine,
  Contact,
  LogIn,
  LogOut,
  User2,
  FileText,
  LayoutPanelTop,
  Layout,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const InsertNavbar = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const username = session?.user?.username;

  // Tab navigation handler
  const handleTabClick = (tab: string) => {
    if (username) router.push(`/u/${username}?tab=${tab}`);
  };

  return (
    // <div className="flex gap-10 justify-center py-10 px-6 content-col">
    // <div className="flex justify-center w-full">
    <nav className="flex justify-between items-center gap-10">
      <Link className="flex items-center gap-2 text-5xl font-sans" href={`/`}>
        Insert
      </Link>

      <NavigationMenu>
        <NavigationMenuList>
          {status === "authenticated" && username && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Sections</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col gap-6 w-[220px] p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/u/${username}?tab=overview`}
                        className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                      >
                        <User2 className="h-4 w-4" />
                        <span className="text-sm">Overview</span>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/u/${username}?tab=topics`}
                        className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Topics</span>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/u/${username}?tab=blogs`}
                        className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                      >
                        <LayoutPanelTop className="h-4 w-4" />
                        <span className="text-sm">Blogs</span>
                      </Link>
                    </NavigationMenuLink>

                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          {status === "authenticated" && username && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Posts</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col gap-6 w-[220px] p-2">
                  <li>
                    {/* <NavigationMenuLink asChild aria-disabled='true'>
                      <Link
                        href={`/`}
                        className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Topics</span>
                      </Link>
                    </NavigationMenuLink> */}
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/posts/blog`}
                        className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
                      >
                        <LayoutPanelTop className="h-4 w-4" />
                        <span className="text-sm">Blogs</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          {/* Profile & Write */}
          {session && status === "authenticated" && (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href={`/u/${session.user?.username}`}>
                    <User className="inline mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/write">
                    <FilePenLine className="inline mr-2 h-4 w-4" />
                    Write
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="mailto:insertcontact999@gmail.com">
                    <Contact className="inline mr-2 h-4 w-4" />
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </>
          )}

          {/* Contact */}

          {/* Auth */}
          <NavigationMenuItem>
            {status === "authenticated" ? (
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-2 py-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </NavigationMenuLink>
            ) : (
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/sign-in" className="flex items-center gap-2">
                  <LogIn className="inline mr-2 h-4 w-4" />
                  Login
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* {status === "authenticated" && (
                        <button
                            className="relative ml-4"
                        >
                            <MessageSquare className="text-2xl" />
                        </button>
                    )} */}
    </nav>
    // </div>
    // </div>
  );
};

export default InsertNavbar;
