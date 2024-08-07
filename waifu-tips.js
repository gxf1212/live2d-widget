/*
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */

// consider switching to https://github.com/mosuzi/live_fe/blob/master/assets/waifu-tips.js, to get a toolbar?

function loadWidget(config) {
	let { waifuPath, apiPath, cdnPath } = config;
	let useCDN = false, modelList;
	if (typeof cdnPath === "string") {
		useCDN = true;
		if (!cdnPath.endsWith("/")) cdnPath += "/";
	} else if (typeof apiPath === "string") {
		if (!apiPath.endsWith("/")) apiPath += "/";
	} else {
		console.error("Invalid initWidget argument!");
		return;
	}
	localStorage.removeItem("waifu-display");
	sessionStorage.removeItem("waifu-text");
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
			<div id="waifu-tips"></div>
			<canvas id="live2d" width="800" height="800"></canvas>
			<div id="waifu-tool">
				<span class="fa fa-lg fa-comment"></span>
				<span class="fa fa-lg fa-paper-plane"></span>
				<span class="fa fa-lg fa-user-circle"></span>
				<span class="fa fa-lg fa-street-view"></span>
				<span class="fa fa-lg fa-camera-retro"></span>
				<span class="fa fa-lg fa-info-circle"></span>
				<span class="fa fa-lg fa-times"></span>
			</div>
		</div>`);
	// https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
	setTimeout(() => {
		document.getElementById("waifu").style.bottom = 0;
	}, 0);

	function randomSelection(obj) {
		return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
	}
	// 检测用户活动状态，并在空闲时显示消息
	let userAction = false,
		userActionTimer,
		messageTimer,
		messageArray = ["嗨～快来逗我玩吧！", "记得把小家加入 Adblock 白名单哦！", "你觉得我的眼睛好看吗？",
			"B站搜索<a href='https://space.bilibili.com/441196634' target='_blank'> 「东山月光下」 </a>关注我哦~",
			"B站搜索<a href='https://space.bilibili.com/441196634' target='_blank'> 「东山月光下」 </a>关注我哦~",
					"夏虫也为我沉默，沉默是今晚的康桥。", "不理睬是最大的轻蔑。",
					"既然选择了远方，便只顾风雨兼程。", "只要热爱生命，一切都在预料之中。",
					"月出于东山之上，徘徊于斗牛之间。",

					"你到了我这个年纪，就会发现当年以为天要塌下来的那些大事，其实没有什么的。",
					"巨日的表面构成了火焰的大地，他感觉自己正向这灿烂的地狱坠落！",
					"不管后来的历史学家和文学家们如何描述，当时的真实情景就是这样平淡无奇。",
					"在静静的午夜，宇宙向它的聆听者展示着广漠的荒凉。",
					"没什么，一场梦，醒了而已。",

					"没有了对高处的恐惧就体会不到高处之美。",
					"这冷静来自于我的玩世不恭，这世界上很难有什么东西让我在意。", 
					"现在我们都成了婊子养的。", "唉，睿智的人都死得早。",
					"外部世界也许真的是一种类似于量子态的东西，他不观察就不存在。",
					"星辰用晶莹的光芒织成银色的巨毯，群星振动着，奏出华美的音乐。",
					"夜雨落在湖边的草丛中，仿佛来自另一个时空的无数声倾诉。",
					"出现这幅思维图景时，我正在想你。",
					"即使魔鬼真的出现了，冷静和理智也是最好的选择。",
					"在他们后面，黄金时代刚刚结束；在他们前面，人类的艰难岁月正在徐徐展开。",
					"一样东西，要是离我们心中的概念差得太远，可不是好兆头。",
					"歌德说过：“我爱你，与你无关。”", "黑暗是生命和文明之母。",
					"你们所知道的荣耀是从历史记载中看到的，我们的创伤是父辈和祖辈的鲜血凝成的。",
					"蓝色空间号和青铜时代号承载着人类的全部思想和记忆，怀抱着地球所有的光荣与梦想，默默地消失在永恒的夜色中。",
					
					"我挥挥手，那个夕阳前的剪影也挥挥手。看着那个身影，我感觉自己还是很年轻的。",
					"很好地与这种环境融为一体的人，同时也对它产生了依赖感。", 
					"你会把你妈卖给妓院吗？", 
					"这黑暗之外是更恐怖的所在，那里正在浮现的某种东西，使寒冷感到冷，使黑暗感到黑。",
					"时空的薄膜在引力波中泛起一片涟漪，像风吹皱了暗夜中的湖面。",
					"宇宙很大，生活更大，也许以后还有缘相见。",
					"没有故事的王国中的人民是最幸福的，因为故事就意味着曲折和灾难。",
					"太阳升起时，仿佛绘制这幅画的画师抓起一把金粉豪爽地撒向整个画面。",
					"我有那么娇气吗？", 
					"没有什么能永远存在，即使是宇宙也有灭亡的那一天，凭什么人类就觉得自己该永远存在下去。",
					"死亡是唯一一座永远亮着的灯塔，不管你向哪里航行，最终都得转向它指引的方向。",
					"不知从什么时候起，人类有了一种幻觉，认为生存成了唾手可得的东西。",
					"他仍然穿着那身黑皮夹克，仿佛在显示对太空的鄙视。",
					"我喜欢荒凉的地方，生命对物理学是一种干扰。",
					"在这寒冷广漠的宇宙中，同为碳基生命本身就是一种缘分，一种可能要几十亿年才能修得的缘分。",
					"知道吗？我最怕的就是你会怕。",
					"对于智慧文明来说，它们最后总变得和自己的思想一样大。"];
	window.addEventListener("mousemove", () => userAction = true);
	window.addEventListener("keydown", () => userAction = true);
	setInterval(() => {
		if (userAction) {
			userAction = false;
			clearInterval(userActionTimer);
			userActionTimer = null;
		} else if (!userActionTimer) {
			userActionTimer = setInterval(() => {
				showMessage(randomSelection(messageArray), 6000, 9);
			}, 20000);
		}
	}, 1000);

	(function registerEventListener() {
		document.querySelector("#waifu-tool .fa-comment").addEventListener("click", showHitokoto);
		document.querySelector("#waifu-tool .fa-paper-plane").addEventListener("click", () => {
			if (window.Asteroids) {
				if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
				window.ASTEROIDSPLAYERS.push(new Asteroids());
			} else {
				const script = document.createElement("script");
				script.src = "https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
				document.head.appendChild(script);
			}
		});
		document.querySelector("#waifu-tool .fa-user-circle").addEventListener("click", loadOtherModel);
		document.querySelector("#waifu-tool .fa-street-view").addEventListener("click", loadRandModel);
		document.querySelector("#waifu-tool .fa-camera-retro").addEventListener("click", () => {
			showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
			Live2D.captureName = "photo.png";
			Live2D.captureFrame = true;
		});
		document.querySelector("#waifu-tool .fa-info-circle").addEventListener("click", () => {
			open("https://github.com/stevenjoezhang/live2d-widget");
		});
		document.querySelector("#waifu-tool .fa-times").addEventListener("click", () => {
			localStorage.setItem("waifu-display", Date.now());
			showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
			document.getElementById("waifu").style.bottom = "-500px";
			setTimeout(() => {
				document.getElementById("waifu").style.display = "none";
				document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
			}, 3000);
		});
		const devtools = () => {};
		console.log("%c", devtools);
		devtools.toString = () => {
			showMessage("哈哈，你打开了控制台，是想要看看我的小秘密吗？", 6000, 9);
		};
		window.addEventListener("copy", () => {
			showMessage("你都复制了些什么呀，转载要记得加上出处哦！", 6000, 9);
		});
		window.addEventListener("visibilitychange", () => {
			if (!document.hidden) showMessage(["哇，你终于回来了～", "只是说一句，好久不见。", "我儿子还活着！", "欢迎您再次登录《三体》。"], 6000, 9);
		});
	})();

	(function welcomeMessage() {
		let text;
		if (location.pathname === "/") { // 如果是主页
			const now = new Date().getHours();
			if (now > 5 && now <= 7) text = "早上好！一日之计在于晨，美好的一天就要开始了。";
			else if (now > 7 && now <= 11) text = "上午好！工作顺利嘛，不要久坐，多起来走动走动哦！";
			else if (now > 11 && now <= 13) text = "中午了，工作了一个上午，现在是午餐时间！";
			else if (now > 13 && now <= 17) text = "午后很容易犯困呢，今天的运动目标完成了吗？";
			else if (now > 17 && now <= 19) text = "傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红～";
			else if (now > 19 && now <= 21) text = "晚上好，今天过得怎么样？";
			else if (now > 21 && now <= 23) text = ["已经这么晚了呀，早点休息吧，晚安～", "深夜时要爱护眼睛呀！"];
			else text = "你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？";
		} else if (document.referrer !== "") {
			const referrer = new URL(document.referrer),
				domain = referrer.hostname.split(".")[1];
			if (location.hostname === referrer.hostname) text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
			else if (domain === "baidu") text = `Hello！来自 百度搜索 的朋友<br>你是搜索 <span>${referrer.search.split("&wd=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain === "so") text = `Hello！来自 360搜索 的朋友<br>你是搜索 <span>${referrer.search.split("&q=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain === "google") text = `Hello！来自 谷歌搜索 的朋友<br>欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
			else text = `Hello！来自 <span>${referrer.hostname}</span> 的朋友`;
		} else {
			text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
		}
		showMessage(text, 7000, 8);
	})();

	function showHitokoto() {
		// 增加 hitokoto.cn 的 API
		fetch("https://v1.hitokoto.cn")
			.then(response => response.json())
			.then(result => {
				const text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
				showMessage(result.hitokoto, 6000, 9);
				setTimeout(() => {
					showMessage(text, 4000, 9);
				}, 6000);
			});
	}

	function showMessage(text, timeout, priority) {
		if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
		if (messageTimer) {
			clearTimeout(messageTimer);
			messageTimer = null;
		}
		text = randomSelection(text);
		sessionStorage.setItem("waifu-text", priority);
		const tips = document.getElementById("waifu-tips");
		tips.innerHTML = text;
		tips.classList.add("waifu-tips-active");
		messageTimer = setTimeout(() => {
			sessionStorage.removeItem("waifu-text");
			tips.classList.remove("waifu-tips-active");
		}, timeout);
	}

	(function initModel() {
		let modelId = localStorage.getItem("modelId"),
			modelTexturesId = localStorage.getItem("modelTexturesId");
		if (modelId === null) {
			// 首次访问加载 指定模型 的 指定材质
			modelId = 1; // 模型 ID
			modelTexturesId = 53; // 材质 ID
		}
		loadModel(modelId, modelTexturesId);
		fetch(waifuPath)
			.then(response => response.json())
			.then(result => {
				window.addEventListener("mouseover", event => {
					for (let { selector, text } of result.mouseover) {
						if (!event.target.matches(selector)) continue;
						text = randomSelection(text);
						text = text.replace("{text}", event.target.innerText);
						showMessage(text, 4000, 8);
						return;
					}
				});
				window.addEventListener("click", event => {
					for (let { selector, text } of result.click) {
						if (!event.target.matches(selector)) continue;
						text = randomSelection(text);
						text = text.replace("{text}", event.target.innerText);
						showMessage(text, 4000, 8);
						return;
					}
				});
				result.seasons.forEach(({ date, text }) => {
					const now = new Date(),
						after = date.split("-")[0],
						before = date.split("-")[1] || after;
					if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
						text = randomSelection(text);
						text = text.replace("{year}", now.getFullYear());
						//showMessage(text, 7000, true);
						messageArray.push(text);
					}
				});
			});
	})();

	async function loadModelList() {
		const response = await fetch(`${cdnPath}model_list.json`);
		modelList = await response.json();
	}

	async function loadModel(modelId, modelTexturesId, message) {
		localStorage.setItem("modelId", modelId);
		localStorage.setItem("modelTexturesId", modelTexturesId);
		showMessage(message, 4000, 10);
		if (useCDN) {
			if (!modelList) await loadModelList();
			const target = randomSelection(modelList.models[modelId]);
			loadlive2d("live2d", `${cdnPath}model/${target}/index.json`);
		} else {
			loadlive2d("live2d", `${apiPath}get/?id=${modelId}-${modelTexturesId}`);
			console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
		}
	}

	async function loadRandModel() {
		const modelId = localStorage.getItem("modelId"),
			modelTexturesId = localStorage.getItem("modelTexturesId");
		if (useCDN) {
			if (!modelList) await loadModelList();
			const target = randomSelection(modelList.models[modelId]);
			loadlive2d("live2d", `${cdnPath}model/${target}/index.json`);
			showMessage("我的新衣服好看嘛？", 4000, 10);
		} else {
			// 可选 "rand"(随机), "switch"(顺序)
			fetch(`${apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
				.then(response => response.json())
				.then(result => {
					if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
					else loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
				});
		}
	}

	async function loadOtherModel() {
		let modelId = localStorage.getItem("modelId");
		if (useCDN) {
			if (!modelList) await loadModelList();
			const index = (++modelId >= modelList.models.length) ? 0 : modelId;
			loadModel(index, 0, modelList.messages[index]);
		} else {
			fetch(`${apiPath}switch/?id=${modelId}`)
				.then(response => response.json())
				.then(result => {
					loadModel(result.model.id, 0, result.model.message);
				});
		}
	}
}

function initWidget(config, apiPath) {
	if (typeof config === "string") {
		config = {
			waifuPath: config,
			apiPath
		};
	}
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
			<span>看板娘</span>
		</div>`);
	const toggle = document.getElementById("waifu-toggle");
	toggle.addEventListener("click", () => {
		toggle.classList.remove("waifu-toggle-active");
		if (toggle.getAttribute("first-time")) {
			loadWidget(config);
			toggle.removeAttribute("first-time");
		} else {
			localStorage.removeItem("waifu-display");
			document.getElementById("waifu").style.display = "";
			setTimeout(() => {
				document.getElementById("waifu").style.bottom = 0;
			}, 0);
		}
	});
	if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
		toggle.setAttribute("first-time", true);
		setTimeout(() => {
			toggle.classList.add("waifu-toggle-active");
		}, 0);
	} else {
		loadWidget(config);
	}
}
