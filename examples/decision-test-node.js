
const apiKey = process.env.ADZERK_API_KEY;

const AdzerkDecision = require("fix-esm").require('@adzerk/decision-sdk');


const crypto = require('node:crypto')

async function hashEmail(email) {
	const hash = crypto.createHash('sha256')
	hash.update(email)
	return hash.digest('hex')
}


async function decisionTest(email, net, site, zone, types, kw) {

	// hash email/phone if avail
	const hash = email ? await hashEmail(email) : null

	let client = new AdzerkDecision.Client({networkId: net, 
		siteId: site, 
		zoneId: zone,
		host: 'promos.moxplatform.com' });


	let request = {
	  placements: [{ networkId: net, siteId: site, zoneIds: [zone], adTypes: types }],
	  user: { key: hash },
	  keywords: kw
	};

	const options = {
// 	  includeExplanation: true,
	  apiKey
	};

	client.decisions.get(request, options).then(response => {
	  console.dir(response, { depth: null });
	  
	  if (response.decisions && response.decisions.div0 && response.decisions.div0.length) {
		  console.dir(response.decisions.div0[0], {depth:null})

		  // send this to client response.decisions.div0[0] 
		  // or the whole list response.decisions.div0 for multiple ads 
		  // see ad in contents - either use data.imageUrl with clickUrl, or the html from 'body'
		  // and  fire the impressionUrl  when image shown

		  const d = response.decisions.div0[0]
		  if (d && d.contents && d.contents.length) {
		  	  let c = d.contents[0]
			  console.log(c.template, ":     ", c.data.imageUrl, c.data.width, c.data.height)
			  console.log("impression: ", d.impressionUrl)
			  console.log("clickUrl:   ", d.clickUrl)		  
		  }
	  }
	});
}


decisionTest("+44849463221", 11326, 1263050, 300304, [10, 5], ["optional-keyword1", "keyword2"])
