import {
	findUserForAuth,
	findUserWithEmailAndPassword,
	findUserByUauth,
	insertUser,
} from "../db/user";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import jwksRsa from "jwks-rsa";

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((req, id, done) => {
	findUserForAuth(req.db, id).then(
		(user) => done(null, user),
		(err) => done(err)
	);
});

passport.use(
	new LocalStrategy(
		{ usernameField: "email", passReqToCallback: true },
		async (req, email, password, done) => {
			const user = await findUserWithEmailAndPassword(
				req.db,
				email,
				password
			);
			if (user) done(null, user);
			else
				done(null, false, {
					message: "Email or password is incorrect",
				});
		}
	)
);

passport.use(
	new JwtStrategy(
		{
			// Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
			secretOrKeyProvider: jwksRsa.passportJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `https://auth.unstoppabledomains.com/.well-known/jwks.json`,
			}),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

			// Validate the audience and the issuer.
			issuer: "https://auth.unstoppabledomains.com/",
			algorithms: ["RS256"],
			passReqToCallback: true,
		},
		async (req, jwt_payload, done) => {
			const user = await findUserByUauth(req.db, jwt_payload.sub);
			if (!user) {
				console.log(jwt_payload);
				const user = await insertUser(req.db, {
					email: jwt_payload.sub + "@example.com",
					bio: "",
					username: jwt_payload.sub,
					name: jwt_payload.sub,
					uauth: jwt_payload.sub,
					ethereum: [
						{
							_id: "metamask1",
							name: "Unstoppable",
							address: jwt_payload.wallet_address,
						},
					],
					createdAt: new Date(),
				});
				req.logIn(user, (err) => {
					if (err) {
						done(null, false, {
							message: "Account creation failed",
						});
					}
					done(null, user);
				});
			} else {
				done(null, user);
			}
		}
	)
);

export default passport;
