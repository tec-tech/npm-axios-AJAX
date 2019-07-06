const axios = require('axios');
const Util = require('tectech-util');

const AJAX = {
	test: function(){console.log('** test from AJAX **');},	// test function
	sender: null,	// apiにて「_self」でアクセス
	$store: null,	// nuxtグローバルオブジェクト
	sendCount : 0,
	loadingLock: false,
	ERROR_FUNCTION: null,
	send: (url, data, useroptions, sender)=>{
		data = data || {};
		AJAX.sender = sender || null;

		if(typeof $nuxt!=="undefined" && $nuxt.$store.state) $nuxt.$store.commit('loading', true);
		AJAX.sendCount++;

		// option 設定
		let defaults = {
			type: 'post',		// 送信METHOD
		};
		let opt = Util.extend(defaults, useroptions);
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
			console.log('%c>>>>>>>>>>>>>>>>>>>>>>>>>>>> Ajax[POST] '+url, 'color:#9664c3');
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
		})
		.then((res)=>{
			// console.log('res=>', res.data);
			if(res.status >= 400 && res.status < 500){
				console.warn(res.status, res.statusText, url, );
				if(AJAX.ERROR_FUNCTION) AJAX.ERROR_FUNCTION(res);
			}
			AJAX.complete(res.data);

			return res.data;
		}).catch((err) => {
			if(typeof $nuxt!=="undefined" && $nuxt.$store) $nuxt.$store.commit('loading', false);
			console.error('*********************************************');
			if(err.response){
				console.error(err.response.data);
				// console.error(err.response.status);
				// console.error(err.response.statusText);
				// console.error(err.response.headers);
			}else if(err.request){
				console.error(err.request);
			}else{
				console.error(err.message);
			}
			console.error('*********************************************');
		});
	},
	//===================================
	// 完了処理
	//===================================
	complete:(oj)=>{
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
					alert("script execute error\n\n" + e +"\n\nscript:-----\n"+val);
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

		AJAX.sendCount--;
		if(typeof $nuxt!=="undefined" && $nuxt.$store.state && AJAX.sendCount < 1){
			$nuxt.$store.commit('loading', false);
		}

	},
}
module.exports = AJAX;

// import store from '../store/store.js';
// import jQuery from 'jquery';
// const jq = jQuery;
// const AJAX = {
// 	sender: null,	// apiにて「_self」でアクセス
// 	sendCount : 0,
// 	loadingLock: false,
// 	loadingLockClear: ()=>{
// 		AJAX.loadingLock=false;
// 		store.state.loading = false;
// 	},
// 	send: (url, data, useroptions, sender)=>{
// 		AJAX.sender = sender;
// 		AJAX.sendCount++;
// 		if(!AJAX.loadingLock) store.state.loading = true;
// 		// console.log(store);
// 		url = '/api/'+url;
// 		let defaults = {
// 			type: 'post',		// 送信METHOD
// 			async: true,		// 送信同期、非同期
// 			submitOnly: false,	// 送信のみ
// 			raw: false,			// 送信のみ
// 		};
// 		var opt = $.extend(defaults,useroptions);
// 		var ajaxParam = {
// 			dataType : 'json',
// 			type: opt.type,
// 			url: url,
// 			async: opt.async,
// 			data: data,
// 			processData: (opt.fd) ? false : true,
// 			contentType: (opt.fd) ? false : "application/x-www-form-urlencoded",
// 			beforeSend: function() {
// 			},
// 		};
// 		if(NODE_ENV_DEBUG){
// 			console.log('%c>>>>>>>>>>>>>>>>>>>>>>>>>>>> Ajax['+ajaxParam.type+'] '+ajaxParam.url, 'color:#9664c3');
// 			console.log(data);
// 			console.log('%c>>>>>>>>>>>>>>>>>>>>>>>>>>>>', 'color:#9664c3');
// 		}

// 		if(!opt.raw){
// 			ajaxParam.complete = (res)=>{
// 			};
// 			ajaxParam.success = (res)=>{
// 				AJAX.complete(res);
// 			};
// 			ajaxParam.error = (res)=>{
// 				// 認証エラー
// 				if(res.status == 401){
// 					console.error("認証エラー "+LOGIN_PAGE_URL+" にリダイレクトします");
// 					location.href=LOGIN_PAGE_URL;
// 					return;
// 				}
// 				var mess = "AJAX 通信エラー\n\n";
// 				mess += "------------------------------------------------\n";
// 				mess += "XMLHttpRequest : " + res.status + "\n";
// 				mess += "statusText : " + res.statusText + "\n";
// 				mess += "responseText : " + res.responseText + "\n";
// 				console.error(mess);
// 				alert(mess);
// 				AJAX.loadingLock= flase;
// 				store.state.loading = false;
// 			};
// 		}else{
// 			ajaxParam.error = (res)=>{
// 				var mess = "AJAX 通信エラー\n\n";
// 				mess += "------------------------------------------------\n";
// 				mess += "XMLHttpRequest : " + res.status + "\n";
// 				mess += "statusText : " + res.statusText + "\n";
// 				mess += "responseText : " + res.responseText + "\n";
// 				console.error(mess);
// 				AJAX.loadingLock= flase;
// 				store.state.loading = false;
// 			};
// 		}
// 		return $.ajax(ajaxParam);
// 	},
// 	//===================================
// 	// ファイルアップロード処理
// 	//===================================
// 	uploadFile: (url, file, useroptions, sender)=>{
// 		console.log('ファイルアップロード処理', file);
// 		let fd = new FormData();
// 		fd.append("file", file);
// 		// 送信追加データ格納
// 		if(useroptions.addData){
// 			Object.keys(useroptions.addData).forEach(function(key, index){
// 				console.log(key);
// 				fd.append(key, useroptions.addData[key]);
// 			}, useroptions.addData);
// 		}
// 		return $.ajax({
// 			async: true,
// 			xhr : function(){
// 				var XHR = $.ajaxSettings.xhr();
// 				if(XHR.upload){
// 					var progre = 0;
// 					XHR.upload.addEventListener('progress',function(e){
// 						progre = parseInt(e.loaded/e.total*100)/1;
// 						console.log('progre->',progre, useroptions.rateElm);
// 						// コールバック関数設定
// 						if(useroptions.progressCallback){
// 							let arg = null;
// 							if(useroptions.progressCallbackArg) arg = useroptions.progressCallbackArg;
// 							useroptions.progressCallback(progre, arg);
// 						}
// 						if(e.loaded == e.total){
// 							console.log('完了');
// 						}
// 					}, false); 
// 				}
// 				return XHR;
// 			},
// 			url: '/api/'+url,
// 			type: "post",
// 			dataType : 'json',
// 			data:fd,
// 			contentType: false,
// 			processData: false,
// 			success: function(res){
// 				console.log('ファイルアップロード完了', res);
// 				AJAX.complete(res);
// 				// コールバック関数設定
// 				if(useroptions.callback){
// 					let arg = null;
// 					if(useroptions.callbackArg) arg = useroptions.callbackArg;
// 					useroptions.callback(res.data, arg);
// 				}
// 			},
// 			error: function(e){
// 				console.error('ファイルアップロードエラー', e.responseText);
// 			},
// 		});

// 	},
// 	//===================================
// 	// ファイルダウンロード処理
// 	//===================================
// 	downloadFile: function(url, useroptions){
// 		let defaults = {
// 			fName: 'downdload',		// ファイル名
// 			fType: 'text/plain',	// 送信同期、非同期
// 		};
// 		var opt = $.extend(defaults,useroptions);

// 		var xhr = new XMLHttpRequest();
// 		xhr.open('GET', url, true);
// 		xhr.responseType = 'arraybuffer';
// 		xhr.onload = function(e) {
// 			// ArrayBufferで返ってくる
// 			console.log(this.response.byteLength);
// 			var bytes = new Uint8Array(this.response);
// 			var binaryData = "";
// 			for (var i = 0, len = bytes.byteLength; i < len; i++) {
// 				binaryData += String.fromCharCode(bytes[i]);
// 			}

// 			let downloadUrl = "data:"+opt.fType+";base64," + window.btoa(binaryData);
// 			let link = document.createElement('A');
// 			link.href = downloadUrl;
// 			link.download = opt.fName;
// 			link.click();
// 			(window.URL || window.webkitURL).revokeObjectURL(downloadUrl);
// 		};

// 		xhr.send();
// 	},

// }

// export default AJAX
