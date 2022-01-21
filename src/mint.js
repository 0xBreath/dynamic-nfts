const {PublicKey, Transaction, TransactionInstruction} = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const {SystemProgram, SYSVAR_RENT_PUBKEY} = require("@solana/web3.js");
const { serialize } = require('borsh');
const fetch = require('node-fetch');
const {MintLayout, Token, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID} = require('@solana/spl-token');
const {TOKEN_METADATA_PROGRAM_ID} = require("./constant");
const {METADATA_SCHEMA, CreateMetadataArgs, Data, Creator, CreateMasterEditionArgs} = require("./schema");
const {getMetadataPDA} = require("./utils");
const fs = require('fs')

async function mintNFT(
    connection,
    walletKeypair,
    metadataLink,
    destination,
    index
) {
    const data = await createMetadata(metadataLink);
    if (!data) return;

    const wallet = new anchor.Wallet(walletKeypair);

    // Allocate memory for the account
    const mintRent = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span,
    );

    // Generate a mint
    const mint = anchor.web3.Keypair.generate();
    const signers = [mint, walletKeypair];
    let instructions = [];

    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mint.publicKey,
            lamports: mintRent,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
        }),
    );

        instructions.push(
            Token.createInitMintInstruction(
                TOKEN_PROGRAM_ID,
                mint.publicKey,
                0,
                wallet.publicKey,
                wallet.publicKey,
            ),
        );

        let associatedAddr = (await PublicKey.findProgramAddress(
            [destination.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
        ))[0];

        instructions.push(
            Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint.publicKey,
                associatedAddr,
                destination,
                wallet.publicKey,
            ),
        )
        console.log('NEWMINT: ', mint.publicKey.toString())
        console.log('USER: ', destination.toBase58())
            const metadataAccountAddr = await getMetadataPDA(mint.publicKey)
            let txnData = Buffer.from(
                serialize(
                    METADATA_SCHEMA,
                    new CreateMetadataArgs({ data: data, isMutable: true }),
                ),
            );

            instructions.push(
                createMetadataInstruction(
                    metadataAccountAddr,
                    mint.publicKey,
                    wallet.publicKey,
                    wallet.publicKey,
                    wallet.publicKey,
                    txnData,
                ),
            );

            instructions.push(
                Token.createMintToInstruction(
                    TOKEN_PROGRAM_ID,
                    mint.publicKey,
                    associatedAddr,
                    wallet.publicKey,
                    [],
                    1,
                ),
            );


            let masterEditionAddr = (await PublicKey.findProgramAddress(
                [
                    Buffer.from('metadata'),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.publicKey.toBuffer(),
                    Buffer.from('edition'),
                ],
                TOKEN_METADATA_PROGRAM_ID,
            ))[0];
            txnData = Buffer.from(
                serialize(
                    METADATA_SCHEMA,
                    new CreateMasterEditionArgs({ maxSupply: 50 }),
                ),
            );

            instructions.push(
                createMasterEditionInstruction(
                    metadataAccountAddr,
                    masterEditionAddr,
                    mint.publicKey,
                    wallet.publicKey,
                    wallet.publicKey,
                    wallet.publicKey,
                    txnData,
                ),
            );

        /*
        let userPath = '../files/trash.json'
        let userBuffer = fs.readFileSync(userPath)
        let users = JSON.parse(userBuffer.toString())
        let user = users[index]
        user.newMint = (mint.publicKey).toBase58()
        console.log('###', user)
        fs.writeFileSync(userPath, JSON.stringify(users))
        */

    const transaction = new Transaction();
    instructions.forEach(instruction => transaction.add(instruction));

    let txSig = await connection.sendTransaction(transaction, [walletKeypair, mint])
    let res = await connection.confirmTransaction(txSig);

    console.log("done :) ", res)
}

async function createMetadata(metadataLink) {
    let metadata;
    try {
        metadata = await (await fetch(metadataLink, {method: 'GET'})).json();
    } catch (e) {
        console.log(e);
        console.log('Invalid metadata at', metadataLink);
        return;
    }

    // Validate metadata
    if (
        !metadata.name ||
        !metadata.image ||
        isNaN(metadata.seller_fee_basis_points) ||
        !metadata.properties ||
        !Array.isArray(metadata.properties.creators)
    ) {
        console.log('Invalid metadata file', metadata);
        return;
    }

    // Validate creators
    const metaCreators = metadata.properties.creators;
    if (
        metaCreators.some(creator => !creator.address) ||
        metaCreators.reduce((sum, creator) => creator.share + sum, 0) !== 100
    ) {
        return;
    }

    const creators = metaCreators.map(
        creator =>
            new Creator({
                address: creator.address,
                share: creator.share,
                verified: creator.address.toString() == "3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4" ? 1 : 0,
            }),
    );

    return new Data(
        {
        symbol: metadata.symbol,
        name: metadata.name,
        uri: metadataLink,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
        creators: creators
        })
}

function createMetadataInstruction(
    metadataAccount,
    mint,
    mintAuthority,
    payer,
    updateAuthority,
    txnData,
) {
    const keys = [
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: mint,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: mintAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: updateAuthority,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: TOKEN_METADATA_PROGRAM_ID,
        data: txnData,
    });
}

function createMasterEditionInstruction(
    metadataAccount,
    editionAccount,
    mint,
    mintAuthority,
    payer,
    updateAuthority,
    txnData,
) {

    const keys = [
        {
            pubkey: editionAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: mint,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: updateAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: mintAuthority,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: TOKEN_METADATA_PROGRAM_ID,
        data: txnData,
    });
}

module.exports = {mintNFT, createMetadata}
