const axios = require('axios');
const Util = require('tectech-util');

const AJAX = {
	test: function(){console.log('** test from AJAX **');},	// test function
	sender: null,	// apiにて「_self」でアクセス
	$store: null,	// nuxtグローバルオブジェクト
	sendCount : 0,
	// loadingLock: false,
	ERROR_FUNCTION: null,
	send: (url, data, useroptions, sender)=>{
		data = data || {};
		AJAX.sender = sender || null;

		// option 設定
		let defaults = {
			type: 'post',		// 送信METHOD
			noLoading: false,	// Loading画面を出さない
		};
		let opt = Util.extend(defaults, useroptions);

		if(typeof $nuxt!=="undefined" && $nuxt.$store.state && !opt.noLoading){
			$nuxt.$store.commit('loading', true);
			AJAX.sendCount++;
		}
		if(url.indexOf('http') === 0){
		}else if(process.client){
			// console.log("クライアントモードでAJAXを実行します");
			url = '/api/'+url;
			data._SSR = false;
		}else{
			// console.log("サーバーモードでAJAXを実行します API_URI=>", process.env.API_URI);
			url = process.env.API_URI+"/api/"+url;
			data._SSR = true;
		}
		// if(process.env.DEBUG === 'true' && process.client){
		if(process.env.DEBUG === 'true'){
			console.log('%c>>>>>>>>>>>>>>>>>>>>>>>>>>>> Ajax['+opt.type+'] '+url, 'color:#9664c3');
			console.log(data);
			console.log('%c>>>>>>>>>>>>>>>>>>>>>>>>>>>>', 'color:#9664c3');
		}
			return axios({
				method : opt.type,
				url: url,
				data: data,
				// data: JSON.stringify(data),
				validateStatus: function(status){
					return status >= 200 && status < 500;
				},
				onUploadProgress: opt.onUploadProgress,
			})
			.then((res)=>{
				// console.log('res=>', res.data);
				if(res.status >= 400 && res.status < 500){
					console.warn(res.status, res.statusText, url, );
					if(AJAX.ERROR_FUNCTION) AJAX.ERROR_FUNCTION(res);
				}
				AJAX.complete(res.data, opt);

				return res.data;
			}).catch((err) => {
				console.error('*********************************************');
				if(err.response){
					console.error(err.response.data);
					console.error(err.request);
				}else{
					console.error(err.message);
				}
				console.error('*********************************************');
				AJAX.sendCount=0;
				if(typeof $nuxt!=="undefined" && $nuxt.$store) $nuxt.$store.commit('loading', false);
				throw err;
			});
	},

	//===================================
	// ファイルアップロード処理
	//===================================
	upload:(url, data, useroptions, sender)=>{
		let config = {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress:(e)=>console.log(e,"%"),
		};
		return axios.put(url, data, config)
	},

	//===================================
	// 完了処理
	//===================================
	complete:(oj, opt)=>{
		var _self = AJAX.sender;
		var Obj = oj;
		if(!Obj) return;

		//[alert]----------------
		if(Obj.alert){
			Obj.alert.forEach((val)=>{
				alert(val);
			});
		}

		//[script]----------------
		if(Obj.js){
			Obj.js.forEach((val)=>{
				try{
					eval(val);
				}catch( e ){
					alert("script execute error\n\n" + e +"\n\nscript:--\n"+val);
				}
			});
		}

		//[console]----------------
		if(Obj.console){
			Obj.console.forEach((val)=>{
				if(process.client){
					console.log('%cAPI >> ', "color:red;",val);
				}else{
					console.log(val);
				}
			});
		}
		if(typeof $nuxt==="undefined" || !$nuxt.$store.state) return;
		if(!opt.noLoading){
			AJAX.sendCount--;
		}
		if(AJAX.sendCount<0) AJAX.sendCount=0;
		if(AJAX.sendCount == 0){
			$nuxt.$store.commit('loading', false);
		}

	},
}
module.exports = AJAX;
