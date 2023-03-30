import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
const ProfilePage: NextPage<{ username: string }> = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "collieranthony",
  });
  if (isLoading) return <LoadingPage />;
  if (!data) return <div> 404 </div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>

      <PageLayout>
        <div>{data.username}</div>
      </PageLayout>
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
