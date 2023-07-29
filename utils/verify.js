import {
  b58cdecode,
  b58cencode,
  buf2hex,
  hex2buf,
  isValidPrefix,
  mergebuf,
  prefix,
  validateSignature,
} from '@taquito/utils';
import sodium from'libsodium-wrappers';
import elliptic from 'elliptic';
import toBuffer from 'typedarray-to-buffer';
//import { Signer } from'@taquito/taquito';
const pref = {
  ed: {
    pk: prefix['edpk'],
    sk: prefix['edsk'],
    pkh: prefix.tz1,
    sig: prefix.edsig,
  },
  p2: {
    pk: prefix['p2pk'],
    sk: prefix['p2sk'],
    pkh: prefix.tz3,
    sig: prefix.p2sig,
  },
  sp: {
    pk: prefix['sppk'],
    sk: prefix['spsk'],
    pkh: prefix.tz2,
    sig: prefix.spsig,
  },
};

const _verify = async(address, publicKey, bytes, signature) => {
  const validation = validateSignature(signature)
  if (validation != 3) { return false }
  await sodium.ready;
  const curve = publicKey.substring(0, 2);
  var _publicKey = toBuffer(b58cdecode(publicKey, pref[curve].pk));
  if (pref[curve]) {
    _publicKey = toBuffer(b58cdecode(publicKey, pref[curve].pk));
  } else {
    // AirGap wallets use hex format instead and seem to assume the "ed" curve.
    curve = "ed"
    _publicKey = Buffer.from(publicKey, 'hex')
  }

  let signaturePrefix = signature.startsWith('sig')
  ? signature.substr(0, 3)
  : signature.substr(0, 5);

  if (!isValidPrefix(signaturePrefix)) {
    throw new Error(`Unsupported signature given by remote signer: ${signature}`);
  }

  const publicKeyHash = b58cencode(sodium.crypto_generichash(20, _publicKey), pref[curve].pkh);
  if (publicKeyHash != address) {
    return false
  }

  let sig;
  if (signature.substring(0, 3) === 'sig') {
    sig = b58cdecode(signature, prefix.sig);
  } else if (signature.substring(0, 5) === `${curve}sig`) {
    sig = b58cdecode(signature, pref[curve].sig);
  } else {
    throw new Error(`Invalid signature provided: ${signature}`);
  }

  const bytesHash = sodium.crypto_generichash(32, hex2buf(bytes));

  if (curve === 'ed') {
    try {
      return sodium.crypto_sign_verify_detached(sig, bytesHash, _publicKey);
    } catch (e) {
      return false;
    }
  }

  if (curve === 'sp') {
    const key = new elliptic.ec('secp256k1').keyFromPublic(_publicKey);
    const hexSig = buf2hex(toBuffer(sig));
    const match = hexSig.match(/([a-f\d]{64})/gi);
    if (match) {
      try {
        const [r, s] = match;
        return key.verify(bytesHash, { r, s });
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  if (curve === 'p2') {
    const key = new elliptic.ec('p256').keyFromPublic(_publicKey);
    const hexSig = buf2hex(toBuffer(sig));
    const match = hexSig.match(/([a-f\d]{64})/gi);
    if (match) {
      try {
        const [r, s] = match;
        return key.verify(bytesHash, { r, s });
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  throw new Error(`Curve '${curve}' not supported`);
}

// Returns true if the sig matches, false otherwise.
// address: Tezos address of the signer, example "tz1Y1EPriEw5meSDdmZm6yp5FuVyGxP9nSCF"
//          Really this could be derived from publicKey, so you could take this out.
// publicKey: Public key in prefixed base58 format or hex format, example "sppk7ZThid5DWq5eTwhbu5SkyYkGZTCLZg6BGZ5RPzp3jimKUYL8ADj"
// bytes: Payload that was signed, example "0501000000747a325744667879346d77434a37427678455946754c596f715a64377656565573397a345f64373466336636322d373730332d343062332d613032642d3663306533653166363137635f31363335343839353936333935"
//        Note that the "0501000000" prefix and hex encoding for the rest are required for Kukai wallet and maybe others.
// signature: The sig in base58 format, example "spsig1DFVVksMRM1fCWkTEEubmEU9i5AgnBN3xYzLuRxfoKT9gs5fScvNSUJqyVpzi4uWcSrVvekTNEwN2y6qRHEDGU6VXHjpeS"
const verify = async(address, publicKey, bytes, signature) => {
  try {
    return await _verify(address, publicKey, bytes, signature)
  } catch(err) {
    console.debug("Failed to validate signature", err)
  }
  return false
}

export default verify;