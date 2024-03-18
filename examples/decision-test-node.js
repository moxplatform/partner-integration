// MOX platform - server side (node.js) ad-code example using the decision sdk.
//  see documentation https://dev.kevel.com/docs/javascript-decision-sdk  and https://dev.kevel.com/reference/request
//
// Please make sure to replace the ids with your values from the Ad-Tag settings page in profile!


const apiKey = process.env.ADZERK_API_KEY;

const AdzerkDecision = require("fix-esm").require('@adzerk/decision-sdk');


const crypto = require('node:crypto')

async function hashEmail(email) {
	const hash = crypto.createHash('sha256')
	hash.update(email)
	return hash.digest('hex')
}


async function decisionTest(net, site, zone, types,   email, ip, url, kw, props) {

	// hash email/phone if avail
	const hash = email ? await hashEmail(email) : null

	let client = new AdzerkDecision.Client({networkId: net, 
		siteId: site, 
		zoneId: zone,
		host: 'promos.moxplatform.com' });


	let request = {
	  placements: [{ networkId: net, siteId: site, zoneIds: [zone], adTypes: types }],
	  
	  user: { key: hash },
	  ip,
	  url,
	  keywords: kw
	};
	
	if (hash && props) client.userDb.setCustomProperties(hash, props, net)

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
		  // 
		  // see ad info in 'contents' - either use data.imageUrl with clickUrl, or the html code from 'body'
		  //  See documentation here on different formats: https://dev.kevel.com/reference/response 
		  // and make sure to fire the impressionUrl tracking pixel when the ad was shown

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

// Example using phone number. make sure to replace values (site, zone, types) with your data 
//  from the Ad-Code page in profile! 
// Also please pass in the user's IP address for country targeting, and the URL for tracking. 
// Keywords and additional properties are optional but helpful for ad-targeting.

decisionTest(11396, 1272586, 304847, [4, 10, 5], 
   "+44849463221", "60.111.35.98", "https://page/for//tracking", 
   ["optional-keyword1", "keyword2"], 
   {language: 'en', gender: 'm'})


