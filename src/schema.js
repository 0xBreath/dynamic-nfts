const {BinaryReader, BinaryWriter, deserializeUnchecked} = require("borsh")
const {PublicKey} = require("@solana/web3.js");
const base58  = require('bs58');


class CreateMetadataArgs {
    instruction = 0;
    data = null;
    isMutable;

    constructor(args) {
        this.data = args.data;
        this.isMutable = args.isMutable;
    }
}

class CreateMasterEditionArgs {
    instruction = 10;
    maxSupply = null;
    constructor(args) {
        this.maxSupply = null;//args.maxSupply;
    }
}

class UpdateMetadataArgs {
    instruction = 1;
    data = null;
    updateAuthority =  null;
    primarySaleHappened = null;
    constructor(args) {
        this.data = args.data ? args.data : null;
        this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
        this.primarySaleHappened = args.primarySaleHappened;
    }
}

class Data {
    name;
    symbol;
    uri;
    sellerFeeBasisPoints;
    creators;
    constructor(args) {
        this.name = args.name;
        this.symbol = args.symbol;
        this.uri = args.uri;
        this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
        this.creators = args.creators;
    }
}

class Metadata {
    key = 0;
    updateAuthority =  "";
    mint = "";
    data =  {};
    primarySaleHappened= true;
    isMutable = true;
    editionNonce = null;

    constructor(args) {
        this.key = 2; //Master Edition v1
        this.updateAuthority = args.updateAuthority;
        this.mint = args.mint;
        this.data = args.data;
        this.primarySaleHappened = args.primarySaleHappened;
        this.isMutable = args.isMutable;
        this.editionNonce = args.editionNonce ?? null;
    }
}

class Creator {
    address;
    verified;
    share;

    constructor(args) {
        this.address = args.address;
        this.verified = args.verified;
        this.share = args.share;
    }
}

const METADATA_SCHEMA = new Map([
    [
        CreateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', Data],
                ['isMutable', 'u8'], // bool
            ],
        },
    ],
    [
        CreateMasterEditionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
            ],
        },
    ],
    [
        UpdateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', { kind: 'option', type: Data }],
                ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
                ['primarySaleHappened', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
    [
        Data,
        {
            kind: 'struct',
            fields: [
                ['name', 'string'],
                ['symbol', 'string'],
                ['uri', 'string'],
                ['sellerFeeBasisPoints', 'u16'],
                ['creators', { kind: 'option', type: [Creator] }],
            ],
        },
    ],
    [
        Creator,
        {
            kind: 'struct',
            fields: [
                ['address', 'pubkeyAsString'],
                ['verified', 'u8'],
                ['share', 'u8'],
            ],
        },
    ],
    [
        Metadata,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['updateAuthority', 'pubkeyAsString'],
                ['mint', 'pubkeyAsString'],
                ['data', Data],
                ['primarySaleHappened', 'u8'], // bool
                ['isMutable', 'u8'], // bool
                ['editionNonce', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
]);

const METADATA_REPLACE = new RegExp('\u0000', 'g');

const decodeMetadata = (buffer) => {
    const metadata = deserializeUnchecked(
        METADATA_SCHEMA,
        Metadata,
        buffer,
    );
    metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
    metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
    metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
    return metadata;
};

const extendBorsh = () => {
    BinaryReader.prototype.readPubkey = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return new PublicKey(array);
    };

    BinaryWriter.prototype.writePubkey = function (value) {
        const writer = this;
        writer.writeFixedArray(value.toBuffer());
    };

    BinaryReader.prototype.readPubkeyAsString = function () {
        const reader = this;
        const array = reader.readFixedArray(32);
        return base58.encode(array);
    };

    BinaryWriter.prototype.writePubkeyAsString = function (
        value,
    ) {
        const writer = this;
        writer.writeFixedArray(base58.decode(value));
    };
};

extendBorsh();

module.exports =  {decodeMetadata, METADATA_SCHEMA, CreateMetadataArgs, Data, Creator, CreateMasterEditionArgs, UpdateMetadataArgs}

