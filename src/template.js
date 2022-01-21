

function getNftTemplate(attributesList, name, uri) {
    return {
        name: name,
            symbol: "EOE",
        image: uri,
        properties: {
        files: [
            {
                uri: uri,
                type: "image/png"
            }
        ],
        category: "image",
        creators: [
            {
                address: "3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4",
                verfied: 1,
                share: 0
            },
            {
                address: "GdsgtxH5XP2akDGow3JFvceTxTCgakKm6KoRgVL315f3",
                verified: 0,
                share: 100
            }
        ]
        },
        "description":
        "This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. "+ 
        "Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. "+
        "Or give up the current artwork to never have it come out again and wait for the next cycle… "+
        "A locked Eye will say Locked Forever in its attributes.",
        seller_fee_basis_points: 702.7,
        attributes: attributesList,
        collection: { name: "Eye of Eleriah", family: "Project Eluüne" }
    }
}

function getNftLockerTemplate(attributesList, name, uri) {
    return {
        name: name,
            symbol: "EOE",
        image: uri,
        properties: {
        files: [
            {
                uri: uri,
                type: "image/png"
            }
        ],
        category: "image",
        creators: [
            {
                address: "3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4",
                verfied: 1,
                share: 0
            },
            {
                address: "GdsgtxH5XP2akDGow3JFvceTxTCgakKm6KoRgVL315f3",
                verified: 0,
                share: 100
            }
        ]
        },
        "description":
        "This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. "+ 
        "Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. "+
        "Or give up the current artwork to never have it come out again and wait for the next cycle… "+
        "A locked Eye will say Locked Forever in its attributes.",
        seller_fee_basis_points: 702.7,
        attributes: attributesList,
        collection: { name: "Eye of Eleriah", family: "Project Eluüne" }
    }
}

module.exports = {getNftTemplate, getNftLockerTemplate}

