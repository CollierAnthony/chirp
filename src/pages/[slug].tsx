import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = () => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: "collieranthony",
  });

  if (!data) return <div> 404 </div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>

      <main className="flex h-screen justify-center">
        <div>{data.username}</div>
      </main>
    </>
  );
};
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("No slug");
  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
