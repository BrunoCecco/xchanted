import { database } from "../../api-lib/middlewares";
import nc from "next-connect";
import Head from "next/head";

export default function EmailVerifyPage({ valid }) {
  return (
    <>
      <Head>
        <title>Email verification</title>
      </Head>
      <p>
        {valid
          ? "Thank you for verifying your email address. You may close this page."
          : "It looks like you may have clicked on an invalid link. Please close this window and try again."}
      </p>
    </>
  );
}

export async function getServerSideProps(context) {
  await nc().use(database).run(context.req, context.res);

  const { token } = context.params;

  const deletedToken = await context.req.db
    .collection("tokens")
    .findOneAndDelete({ _id: token, type: "emailVerify" });

  if (!deletedToken.value) return { props: { valid: false } };

  await context.req.db.collection("users").updateOne(
    { _id: deletedToken.value.creatorId },
    {
      $set: { emailVerified: true }
    }
  );

  return { props: { valid: true } };
}