"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof3 = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
	value: true,
});
exports["default"] = void 0;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));
var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = _interopRequireDefault(require("react"));
var _socketClient = require("@iobroker/socket-client");
var _propTypes = _interopRequireDefault(require("prop-types"));
var Sentry = _interopRequireWildcard(require("@sentry/browser"));
var SentryIntegrations = _interopRequireWildcard(require("@sentry/integrations"));
var _material = require("@mui/material");
var _iconsMaterial = require("@mui/icons-material");
var _Prompt = _interopRequireDefault(require("@iobroker/adapter-react-v5/Prompt"));
var _Theme = _interopRequireDefault(require("@iobroker/adapter-react-v5/Theme"));
var _Loader = _interopRequireDefault(require("@iobroker/adapter-react-v5/Components/Loader"));
var _Router2 = _interopRequireDefault(require("@iobroker/adapter-react-v5/Components/Router"));
var _Utils = _interopRequireDefault(require("@iobroker/adapter-react-v5/Components/Utils"));
var _SaveCloseButtons = _interopRequireDefault(require("@iobroker/adapter-react-v5/Components/SaveCloseButtons"));
var _Confirm = _interopRequireDefault(require("@iobroker/adapter-react-v5/Dialogs/Confirm"));
var _i18n = _interopRequireDefault(require("@iobroker/adapter-react-v5/i18n"));
var _Error = _interopRequireDefault(require("@iobroker/adapter-react-v5/Dialogs/Error"));
function _getRequireWildcardCache(e) {
	if ("function" != typeof WeakMap) return null;
	var r = new WeakMap(),
		t = new WeakMap();
	return (_getRequireWildcardCache = function _getRequireWildcardCache(e) {
		return e ? t : r;
	})(e);
}
function _interopRequireWildcard(e, r) {
	if (!r && e && e.__esModule) return e;
	if (null === e || ("object" != _typeof3(e) && "function" != typeof e)) return { default: e };
	var t = _getRequireWildcardCache(r);
	if (t && t.has(e)) return t.get(e);
	var n = { __proto__: null },
		a = Object.defineProperty && Object.getOwnPropertyDescriptor;
	for (var u in e)
		if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : (n[u] = e[u]);
		}
	return (n["default"] = e), t && t.set(e, n), n;
}
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r &&
			(o = o.filter(function (r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})),
			t.push.apply(t, o);
	}
	return t;
}
function _objectSpread(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2
			? ownKeys(Object(t), !0).forEach(function (r) {
					(0, _defineProperty2["default"])(e, r, t[r]);
				})
			: Object.getOwnPropertyDescriptors
				? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
				: ownKeys(Object(t)).forEach(function (r) {
						Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
					});
	}
	return e;
}
function _createSuper(Derived) {
	var hasNativeReflectConstruct = _isNativeReflectConstruct();
	return function _createSuperInternal() {
		var Super = (0, _getPrototypeOf2["default"])(Derived),
			result;
		if (hasNativeReflectConstruct) {
			var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;
			result = Reflect.construct(Super, arguments, NewTarget);
		} else {
			result = Super.apply(this, arguments);
		}
		return (0, _possibleConstructorReturn2["default"])(this, result);
	};
}
function _isNativeReflectConstruct() {
	if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	if (Reflect.construct.sham) return false;
	if (typeof Proxy === "function") return true;
	try {
		Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
		return true;
	} catch (e) {
		return false;
	}
} /**
 * Copyright 2018-2023 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
// import '@iobroker/adapter-react-v5/index.css';
var cssStyle =
	'\nhtml {\n    height: 100%;\n}\n\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n}\n\n/* scrollbar */\n::-webkit-scrollbar-track {\n    background-color: #ccc;\n    border-radius: 5px;\n}\n\n::-webkit-scrollbar {\n    width: 5px;\n    height: 5px;\n    background-color: #ccc;\n}\n\n::-webkit-scrollbar-thumb {\n    background-color: #575757;\n    border-radius: 5px;\n}\n\n#root {\n    height: 100%;\n}\n\n.App {\n    height: 100%;\n}\n\n@keyframes glow {\n    from {\n        background-color: initial;\n    }\n    to {\n        background-color: #58c458;\n    }\n}\n';

// legacy and could be deleted
if (!window.localStorage) {
	window.localStorage = {
		getItem: function getItem() {
			return null;
		},
		setItem: function setItem() {
			return null;
		},
	};
}

/**
 * @extends {Router<import('@iobroker/adapter-react-v5/types').GenericAppProps, import('@iobroker/adapter-react-v5/types').GenericAppState>}
 */
var GenericApp = /*#__PURE__*/ (function (_Router) {
	(0, _inherits2["default"])(GenericApp, _Router);
	var _super = _createSuper(GenericApp);
	/**
	 * @param {import('@iobroker/adapter-react-v5/types').GenericAppProps} props
	 * @param {import('@iobroker/adapter-react-v5/types').GenericAppSettings | undefined} settings
	 */
	function GenericApp(props, settings) {
		var _this;
		(0, _classCallCheck2["default"])(this, GenericApp);
		var ConnectionClass = props.Connection || settings.Connection || _socketClient.Connection;
		// const ConnectionClass = props.Connection === 'admin' || settings.Connection = 'admin' ? AdminConnection : (props.Connection || settings.Connection || Connection);

		if (!window.document.getElementById("generic-app-iobroker-component")) {
			var style = window.document.createElement("style");
			style.setAttribute("id", "generic-app-iobroker-component");
			style.innerHTML = cssStyle;
			window.document.head.appendChild(style);
		}

		// Remove `!Connection.isWeb() && window.adapterName !== 'material'` when iobroker.socket will support native ws
		if (!ConnectionClass.isWeb() && window.io && window.location.port === "3000") {
			try {
				var io = new window.SocketClient();
				delete window.io;
				window.io = io;
			} catch (e) {
				// ignore
			}
		}
		_this = _super.call(this, props);
		/**
		 * @var {LegacyConnection | AdminConnection}
		 */
		(0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "socket", void 0);
		(0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onSystemConfigChanged", function (id, obj) {
			if (obj && id === "system.config") {
				var _obj$common;
				if (_this.socket.systemLang !== (obj === null || obj === void 0 ? void 0 : obj.common.language)) {
					_this.socket.systemLang = (obj === null || obj === void 0 ? void 0 : obj.common.language) || "en";
					_i18n["default"].setLanguage(_this.socket.systemLang);
				}
				if (
					_this._systemConfig.expertMode !==
					!!(obj !== null && obj !== void 0 && (_obj$common = obj.common) !== null && _obj$common !== void 0 && _obj$common.expertMode)
				) {
					_this._systemConfig = (obj === null || obj === void 0 ? void 0 : obj.common) || {};
					_this.setState({
						expertMode: _this.getExpertMode(),
					});
				} else {
					_this._systemConfig = (obj === null || obj === void 0 ? void 0 : obj.common) || {};
				}
			}
		});
		(0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onReceiveMessage", function (message) {
			if (message !== null && message !== void 0 && message.data) {
				if (message.data === "updateTheme") {
					var newThemeName = _Utils["default"].getThemeName();
					_Utils["default"].setThemeName(_Utils["default"].getThemeName());
					var newTheme = _this.createTheme(newThemeName);
					_this.setState(
						{
							theme: newTheme,
							themeName: _this.getThemeName(newTheme),
							themeType: _this.getThemeType(newTheme),
						},
						function () {
							_this.props.onThemeChange && _this.props.onThemeChange(newThemeName);
							_this.onThemeChanged && _this.onThemeChanged(newThemeName);
						},
					);
				} else if (message.data === "updateExpertMode") {
					_this.onToggleExpertMode && _this.onToggleExpertMode(_this.getExpertMode());
				} else if (message.data !== "chartReady") {
					// if not "echart ready" message
					console.debug('Received unknown message: "'.concat(JSON.stringify(message.data), '". May be it will be processed later'));
				}
			}
		});
		/**
		 * @private
		 */
		(0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "onResize", function () {
			_this.resizeTimer && clearTimeout(_this.resizeTimer);
			_this.resizeTimer = setTimeout(function () {
				_this.resizeTimer = null;
				_this.setState({
					width: GenericApp.getWidth(),
				});
			}, 200);
		});
		(0, _Prompt["default"])();
		var query = (window.location.search || "").replace(/^\?/, "").replace(/#.*$/, "");
		var args = {};
		query
			.trim()
			.split("&")
			.filter(function (t) {
				return t.trim();
			})
			.forEach(function (b) {
				var parts = b.split("=");
				args[parts[0]] = parts.length === 2 ? parts[1] : true;
				if (args[parts[0]] === "true") {
					args[parts[0]] = true;
				} else if (args[parts[0]] === "false") {
					args[parts[0]] = false;
				}
			});

		// extract instance from URL
		_this.instance = args.instance !== undefined ? parseInt(args.instance, 10) || 0 : parseInt(window.location.search.slice(1), 10) || 0;
		// extract adapter name from URL
		var tmp = window.location.pathname.split("/");
		_this.adapterName =
			(settings === null || settings === void 0 ? void 0 : settings.adapterName) ||
			props.adapterName ||
			window.adapterName ||
			tmp[tmp.length - 2] ||
			"iot";
		_this.instanceId = "system.adapter.".concat(_this.adapterName, ".").concat(_this.instance);
		_this.newReact = args.newReact === true; // it is admin5

		var location = _Router2["default"].getLocation();
		location.tab = location.tab || (window._localStorage || window.localStorage).getItem("".concat(_this.adapterName, "-adapter")) || "";
		var themeInstance = _this.createTheme();
		_this.state = {
			selectedTab: (window._localStorage || window.localStorage).getItem("".concat(_this.adapterName, "-adapter")) || "",
			selectedTabNum: -1,
			native: {},
			errorText: "",
			changed: false,
			connected: false,
			loaded: false,
			isConfigurationError: "",
			expertMode: false,
			toast: "",
			theme: themeInstance,
			themeName: _this.getThemeName(themeInstance),
			themeType: _this.getThemeType(themeInstance),
			bottomButtons:
				(settings && settings.bottomButtons) === false
					? false
					: (props === null || props === void 0 ? void 0 : props.bottomButtons) !== false,
			width: GenericApp.getWidth(),
			confirmClose: false,
			_alert: false,
			_alertType: "info",
			_alertMessage: "",
		};

		// init translations
		var translations = {
			en: require("@iobroker/adapter-react-v5/i18n/en.json"),
			de: require("@iobroker/adapter-react-v5/i18n/de.json"),
			ru: require("@iobroker/adapter-react-v5/i18n/ru.json"),
			pt: require("@iobroker/adapter-react-v5/i18n/pt.json"),
			nl: require("@iobroker/adapter-react-v5/i18n/nl.json"),
			fr: require("@iobroker/adapter-react-v5/i18n/fr.json"),
			it: require("@iobroker/adapter-react-v5/i18n/it.json"),
			es: require("@iobroker/adapter-react-v5/i18n/es.json"),
			pl: require("@iobroker/adapter-react-v5/i18n/pl.json"),
			uk: require("@iobroker/adapter-react-v5/i18n/uk.json"),
			"zh-cn": require("@iobroker/adapter-react-v5/i18n/zh-cn.json"),
		};

		// merge together
		if (settings && settings.translations) {
			Object.keys(settings.translations).forEach(function (lang) {
				return (translations[lang] = Object.assign(translations[lang], settings.translations[lang]));
			});
		} else if (props.translations) {
			Object.keys(props.translations).forEach(function (lang) {
				return (translations[lang] = Object.assign(translations[lang], props.translations[lang]));
			});
		}
		_i18n["default"].setTranslations(translations);
		_this.savedNative = {}; // to detect if the config changed

		_this.encryptedFields = props.encryptedFields || (settings === null || settings === void 0 ? void 0 : settings.encryptedFields) || [];
		_this.sentryDSN = (settings && settings.sentryDSN) || props.sentryDSN;
		if (window.socketUrl) {
			if (window.socketUrl.startsWith(":")) {
				window.socketUrl = "".concat(window.location.protocol, "//").concat(window.location.hostname).concat(window.socketUrl);
			} else if (!window.socketUrl.startsWith("http://") && !window.socketUrl.startsWith("https://")) {
				window.socketUrl = "".concat(window.location.protocol, "//").concat(window.socketUrl);
			}
		}
		_this.alerDialogRendered = false;
		window.oldAlert = window.alert;
		window.alert = function (message) {
			if (!_this.alerDialogRendered) {
				window.oldAlert(message);
				return;
			}
			if (message && message.toString().toLowerCase().includes("error")) {
				console.error(message);
				_this.showAlert(message.toString(), "error");
			} else {
				console.log(message);
				_this.showAlert(message.toString(), "info");
			}
		};
		_this.socket = new ConnectionClass(
			_objectSpread(
				_objectSpread(
					{},
					(props === null || props === void 0 ? void 0 : props.socket) ||
						(settings === null || settings === void 0 ? void 0 : settings.socket),
				),
				{},
				{
					name: _this.adapterName,
					doNotLoadAllObjects: settings === null || settings === void 0 ? void 0 : settings.doNotLoadAllObjects,
					onProgress: function onProgress(progress) {
						if (progress === _socketClient.PROGRESS.CONNECTING) {
							_this.setState({
								connected: false,
							});
						} else if (progress === _socketClient.PROGRESS.READY) {
							_this.setState({
								connected: true,
							});
						} else {
							_this.setState({
								connected: true,
							});
						}
					},
					onReady: function onReady /* objects, scripts */() {
						_i18n["default"].setLanguage(_this.socket.systemLang);

						// subscribe because of language and expert mode
						_this.socket
							.subscribeObject("system.config", _this.onSystemConfigChanged)
							.then(function () {
								return _this.getSystemConfig();
							})
							.then(function (obj) {
								_this._secret = (typeof obj !== "undefined" && obj["native"] && obj["native"].secret) || "Zgfr56gFe87jJOM";
								_this._systemConfig = (obj === null || obj === void 0 ? void 0 : obj.common) || {};
								return _this.socket.getObject(_this.instanceId);
							})
							.then(function (instanceObj) {
								var waitPromise;
								var sentryEnabled =
									_this._systemConfig.diag !== "none" &&
									instanceObj &&
									instanceObj.common &&
									instanceObj.common.name &&
									instanceObj.common.version &&
									!instanceObj.common.disableDataReporting &&
									window.location.host !== "localhost:3000";

								// activate sentry plugin
								if (!_this.sentryStarted && _this.sentryDSN && sentryEnabled) {
									_this.sentryStarted = true;
									Sentry.init({
										dsn: _this.sentryDSN,
										release: "iobroker.".concat(instanceObj.common.name, "@").concat(instanceObj.common.version),
										integrations: [new SentryIntegrations.Dedupe()],
									});
								}

								// read UUID and init sentry with it.
								// for backward compatibility it will be processed separately from above logic: some adapters could still have this.sentryDSN as undefined
								if (!_this.sentryInited && sentryEnabled) {
									_this.sentryInited = true;
									waitPromise = _this.socket.getObject("system.meta.uuid").then(function (uuidObj) {
										if (uuidObj && uuidObj["native"] && uuidObj["native"].uuid) {
											Sentry.configureScope(function (scope) {
												return scope.setUser({
													id: uuidObj["native"].uuid,
												});
											});
										}
									});
								}
								waitPromise = waitPromise || Promise.resolve();
								waitPromise.then(function () {
									if (instanceObj) {
										_this.common = instanceObj === null || instanceObj === void 0 ? void 0 : instanceObj.common;
										_this.onPrepareLoad(instanceObj["native"], instanceObj.encryptedNative); // decode all secrets
										_this.savedNative = JSON.parse(JSON.stringify(instanceObj["native"]));
										_this.setState(
											{
												native: instanceObj["native"],
												loaded: true,
												expertMode: _this.getExpertMode(),
											},
											function () {
												return _this.onConnectionReady && _this.onConnectionReady();
											},
										);
									} else {
										console.warn("Cannot load instance settings");
										_this.setState(
											{
												native: {},
												loaded: true,
												expertMode: _this.getExpertMode(),
											},
											function () {
												return _this.onConnectionReady && _this.onConnectionReady();
											},
										);
									}
								});
							})
							["catch"](function (e) {
								return window.alert("Cannot settings: ".concat(e));
							});
					},
					onError: function onError(err) {
						console.error(err);
						_this.showError(err);
					},
				},
			),
		);
		return _this;
	}
	(0, _createClass2["default"])(
		GenericApp,
		[
			{
				key: "showAlert",
				value: function showAlert(message, type) {
					if (type !== "error" && type !== "warning" && type !== "info" && type !== "success") {
						type = "info";
					}
					this.setState({
						_alert: true,
						_alertType: type,
						_alertMessage: message,
					});
				},
			},
			{
				key: "renderAlertSnackbar",
				value: function renderAlertSnackbar() {
					var _this2 = this;
					this.alerDialogRendered = true;
					return /*#__PURE__*/ _react["default"].createElement(_material.Snackbar, {
						style:
							this.state._alertType === "error"
								? {
										backgroundColor: "#f44336",
									}
								: this.state._alertType === "success"
									? {
											backgroundColor: "#4caf50",
										}
									: undefined,
						open: this.state._alert,
						autoHideDuration: 6000,
						onClose: function onClose(reason) {
							return (
								reason !== "clickaway" &&
								_this2.setState({
									_alert: false,
								})
							);
						},
						message: this.state.alertMessage,
					});
				},
			},
			{
				key: "componentDidMount",
				value:
					/**
					 * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
					 */
					function componentDidMount() {
						window.addEventListener("resize", this.onResize, true);
						window.addEventListener("message", this.onReceiveMessage, false);
						(0, _get2["default"])((0, _getPrototypeOf2["default"])(GenericApp.prototype), "componentDidMount", this).call(this);
					},

				/**
				 * Called immediately before a component is destroyed.
				 */
			},
			{
				key: "componentWillUnmount",
				value: function componentWillUnmount() {
					window.removeEventListener("resize", this.onResize, true);
					window.removeEventListener("message", this.onReceiveMessage, false);
					(0, _get2["default"])((0, _getPrototypeOf2["default"])(GenericApp.prototype), "componentWillUnmount", this).call(this);
				},
			},
			{
				key: "createTheme",
				value:
					/**
					 * Get a theme
					 * @param {string} name Theme name
					 * @returns {import('@iobroker/adapter-react-v5/types').Theme}
					 */
					function createTheme() {
						var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
						return (0, _Theme["default"])(_Utils["default"].getThemeName(name));
					},

				/**
				 * Get the theme name
				 * @param {import('@iobroker/adapter-react-v5/types').Theme} currentTheme Theme
				 * @returns {string} Theme name
				 */
			},
			{
				key: "getThemeName",
				value: function getThemeName(currentTheme) {
					return currentTheme.name;
				},

				/**
				 * Get the theme type
				 * @param {import('@iobroker/adapter-react-v5/types').Theme} currentTheme Theme
				 * @returns {string} Theme type
				 */
			},
			{
				key: "getThemeType",
				value: function getThemeType(currentTheme) {
					return currentTheme.palette.mode;
				},

				/**
				 * Changes the current theme
				 * @param {string} newThemeName Theme name
				 **/
			},
			{
				key: "toggleTheme",
				value: function toggleTheme(newThemeName) {
					var _this3 = this;
					var themeName = this.state.themeName;

					// dark => blue => colored => light => dark
					newThemeName =
						newThemeName ||
						(themeName === "dark" ? "blue" : themeName === "blue" ? "colored" : themeName === "colored" ? "light" : "dark");
					if (newThemeName !== themeName) {
						_Utils["default"].setThemeName(newThemeName);
						var newTheme = this.createTheme(newThemeName);
						this.setState(
							{
								theme: newTheme,
								themeName: this.getThemeName(newTheme),
								themeType: this.getThemeType(newTheme),
							},
							function () {
								_this3.props.onThemeChange && _this3.props.onThemeChange(newThemeName);
								_this3.onThemeChanged && _this3.onThemeChanged(newThemeName);
							},
						);
					}
				},

				/**
				 * Gets the system configuration.
				 * @returns {Promise<ioBroker.OtherObject>}
				 */
			},
			{
				key: "getSystemConfig",
				value: function getSystemConfig() {
					return this.socket.getSystemConfig();
				},

				/**
				 * Get current expert mode
				 * @returns {boolean}
				 */
			},
			{
				key: "getExpertMode",
				value: function getExpertMode() {
					return window.sessionStorage.getItem("App.expertMode") === "true" || !!this._systemConfig.expertMode;
				},

				/**
				 * Gets called when the socket.io connection is ready.
				 * You can overload this function to execute own commands.
				 */
			},
			{
				key: "onConnectionReady",
				value: function onConnectionReady() {},

				/**
				 * Encrypts a string.
				 * @param {string} value
				 * @returns {string}
				 */
			},
			{
				key: "encrypt",
				value: function encrypt(value) {
					var result = "";
					for (var i = 0; i < value.length; i++) {
						result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i));
					}
					return result;
				},

				/**
				 * Decrypts a string.
				 * @param {string} value
				 * @returns {string}
				 */
			},
			{
				key: "decrypt",
				value: function decrypt(value) {
					var result = "";
					for (var i = 0; i < value.length; i++) {
						result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i));
					}
					return result;
				},

				/**
				 * Gets called when the navigation hash changes.
				 * You may override this if needed.
				 */
			},
			{
				key: "onHashChanged",
				value: function onHashChanged() {
					var location = _Router2["default"].getLocation();
					if (location.tab !== this.state.selectedTab) {
						this.selectTab(location.tab);
					}
				},

				/**
				 * Selects the given tab.
				 * @param {string} tab
				 * @param {number} [index]
				 */
			},
			{
				key: "selectTab",
				value: function selectTab(tab, index) {
					(window._localStorage || window.localStorage).setItem("".concat(this.adapterName, "-adapter"), tab);
					this.setState({
						selectedTab: tab,
						selectedTabNum: index,
					});
				},

				/**
				 * Gets called before the settings are saved.
				 * You may override this if needed.
				 * @param {Record<string, any>} settings
				 */
			},
			{
				key: "onPrepareSave",
				value: function onPrepareSave(settings) {
					var _this4 = this;
					// here you can encode values
					this.encryptedFields &&
						this.encryptedFields.forEach(function (attr) {
							if (settings[attr]) {
								settings[attr] = _this4.encrypt(settings[attr]);
							}
						});
					return true;
				},

				/**
				 * Gets called after the settings are loaded.
				 * You may override this if needed.
				 * @param {Record<string, any>} settings
				 * @param {string[]} encryptedNative optional list of fields to be decrypted
				 */
			},
			{
				key: "onPrepareLoad",
				value: function onPrepareLoad(settings, encryptedNative) {
					var _this5 = this;
					// here you can encode values
					this.encryptedFields &&
						this.encryptedFields.forEach(function (attr) {
							if (settings[attr]) {
								settings[attr] = _this5.decrypt(settings[attr]);
							}
						});
					encryptedNative &&
						encryptedNative.forEach(function (attr) {
							_this5.encryptedFields = _this5.encryptedFields || [];
							!_this5.encryptedFields.includes(attr) && _this5.encryptedFields.push(attr);
							if (settings[attr]) {
								settings[attr] = _this5.decrypt(settings[attr]);
							}
						});
				},

				/**
				 * Gets the extendable instances.
				 * @returns {Promise<any[]>}
				 */
			},
			{
				key: "getExtendableInstances",
				value: function getExtendableInstances() {
					var _this6 = this;
					return new Promise(function (resolve) {
						_this6.socket._socket.emit("getObjectView", "system", "instance", null, function (err, doc) {
							if (err) {
								resolve([]);
							} else {
								resolve(
									doc.rows
										.filter(function (item) {
											return item.value.common.webExtendable;
										})
										.map(function (item) {
											return item.value;
										}),
								);
							}
						});
					});
				},

				/**
				 * Gets the IP addresses of the given host.
				 * @param {string} host
				 */
			},
			{
				key: "getIpAddresses",
				value: function getIpAddresses(host) {
					var _this7 = this;
					return new Promise(function (resolve) {
						_this7.socket._socket.emit("getHostByIp", host || _this7.common.host, function (ip, _host) {
							var IPs4 = [
								{
									name: "[IPv4] 0.0.0.0 - ".concat(_i18n["default"].t("ra_Listen on all IPs")),
									address: "0.0.0.0",
									family: "ipv4",
								},
							];
							var IPs6 = [
								{
									name: "[IPv6] ::",
									address: "::",
									family: "ipv6",
								},
							];
							if (_host) {
								host = _host;
								if (host["native"].hardware && host["native"].hardware.networkInterfaces) {
									Object.keys(host["native"].hardware.networkInterfaces).forEach(function (eth) {
										return host["native"].hardware.networkInterfaces[eth].forEach(function (inter) {
											if (inter.family !== "IPv6") {
												IPs4.push({
													name: "[".concat(inter.family, "] ").concat(inter.address, " - ").concat(eth),
													address: inter.address,
													family: "ipv4",
												});
											} else {
												IPs6.push({
													name: "[".concat(inter.family, "] ").concat(inter.address, " - ").concat(eth),
													address: inter.address,
													family: "ipv6",
												});
											}
										});
									});
								}
								IPs6.forEach(function (_ip) {
									return IPs4.push(_ip);
								});
							}
							resolve(IPs4);
						});
					});
				},

				/**
				 * Saves the settings to the server.
				 * @param {boolean} isClose True if the user is closing the dialog.
				 */
			},
			{
				key: "onSave",
				value: function onSave(isClose) {
					var _this8 = this;
					var oldObj;
					if (this.state.isConfigurationError) {
						this.setState({
							errorText: this.state.isConfigurationError,
						});
						return;
					}
					this.socket
						.getObject(this.instanceId)
						.then(function (_oldObj) {
							oldObj = _oldObj || {};
							for (var a in _this8.state["native"]) {
								if (Object.prototype.hasOwnProperty.call(_this8.state["native"], a)) {
									if (_this8.state["native"][a] === null) {
										oldObj["native"][a] = null;
									} else if (_this8.state["native"][a] !== undefined) {
										oldObj["native"][a] = JSON.parse(JSON.stringify(_this8.state["native"][a]));
									} else {
										delete oldObj["native"][a];
									}
								}
							}
							if (_this8.state.common) {
								for (var b in _this8.state.common) {
									if (_this8.state.common[b] === null) {
										oldObj.common[b] = null;
									} else if (_this8.state.common[b] !== undefined) {
										oldObj.common[b] = JSON.parse(JSON.stringify(_this8.state.common[b]));
									} else {
										delete oldObj.common[b];
									}
								}
							}
							if (_this8.onPrepareSave(oldObj["native"]) !== false) {
								return _this8.socket.setObject(_this8.instanceId, oldObj);
							}
							return Promise.reject(new Error("Invalid configuration"));
						})
						.then(function () {
							_this8.savedNative = oldObj["native"];
							globalThis.changed = false;
							try {
								window.parent.postMessage("nochange", "*");
							} catch (e) {
								// ignore
							}
							_this8.setState({
								changed: false,
							});
							isClose && GenericApp.onClose();
						})
						["catch"](function (e) {
							return console.error("Cannot save configuration: ".concat(e));
						});
				},

				/**
				 * Renders the toast.
				 * @returns {JSX.Element | null} The JSX element.
				 */
			},
			{
				key: "renderToast",
				value: function renderToast() {
					var _this9 = this;
					if (!this.state.toast) {
						return null;
					}
					return /*#__PURE__*/ _react["default"].createElement(_material.Snackbar, {
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						open: !0,
						autoHideDuration: 6000,
						onClose: function onClose() {
							return _this9.setState({
								toast: "",
							});
						},
						ContentProps: {
							"aria-describedby": "message-id",
						},
						message: /*#__PURE__*/ _react["default"].createElement(
							"span",
							{
								id: "message-id",
							},
							this.state.toast,
						),
						action: [
							/*#__PURE__*/ _react["default"].createElement(
								_material.IconButton,
								{
									key: "close",
									"aria-label": "Close",
									color: "inherit",
									className: this.props.classes.close,
									onClick: function onClick() {
										return _this9.setState({
											toast: "",
										});
									},
									size: "large",
								},
								/*#__PURE__*/ _react["default"].createElement(_iconsMaterial.Close, null),
							),
						],
					});
				},

				/**
				 * Closes the dialog.
				 * @private
				 */
			},
			{
				key: "renderError",
				value:
					/**
					 * Renders the error dialog.
					 * @returns {JSX.Element | null} The JSX element.
					 */
					function renderError() {
						var _this10 = this;
						if (!this.state.errorText) {
							return null;
						}
						return /*#__PURE__*/ _react["default"].createElement(_Error["default"], {
							text: this.state.errorText,
							onClose: function onClose() {
								return _this10.setState({
									errorText: "",
								});
							},
						});
					},

				/**
				 * Checks if the configuration has changed.
				 * @param {Record<string, any>} [native] the new state
				 */
			},
			{
				key: "getIsChanged",
				value: function getIsChanged(_native) {
					_native = _native || this.state["native"];
					var isChanged = JSON.stringify(_native) !== JSON.stringify(this.savedNative);
					globalThis.changed = isChanged;
					return isChanged;
				},

				/**
				 * Gets called when loading the configuration.
				 * @param {Record<string, any>} newNative The new configuration object.
				 */
			},
			{
				key: "onLoadConfig",
				value: function onLoadConfig(newNative) {
					if (JSON.stringify(newNative) !== JSON.stringify(this.state["native"])) {
						this.setState({
							native: newNative,
							changed: this.getIsChanged(newNative),
						});
					}
				},

				/**
				 * Sets the configuration error.
				 * @param {string} errorText
				 */
			},
			{
				key: "setConfigurationError",
				value: function setConfigurationError(errorText) {
					if (this.state.isConfigurationError !== errorText) {
						this.setState({
							isConfigurationError: errorText,
						});
					}
				},

				/**
				 * Renders the save and close buttons.
				 * @returns {JSX.Element | undefined} The JSX element.
				 */
			},
			{
				key: "renderSaveCloseButtons",
				value: function renderSaveCloseButtons() {
					var _this11 = this;
					if (!this.state.confirmClose && !this.state.bottomButtons) {
						return null;
					}
					return /*#__PURE__*/ _react["default"].createElement(
						_react["default"].Fragment,
						null,
						this.state.bottomButtons
							? /*#__PURE__*/ _react["default"].createElement(_SaveCloseButtons["default"], {
									theme: this.state.theme,
									newReact: this.newReact,
									noTextOnButtons: this.state.width === "xs" || this.state.width === "sm" || this.state.width === "md",
									changed: this.state.changed,
									onSave: function onSave(isClose) {
										return _this11.onSave(isClose);
									},
									onClose: function onClose() {
										if (_this11.state.changed) {
											_this11.setState({
												confirmClose: true,
											});
										} else {
											GenericApp.onClose();
										}
									},
								})
							: null,
						this.state.confirmClose
							? /*#__PURE__*/ _react["default"].createElement(_Confirm["default"], {
									title: _i18n["default"].t("ra_Please confirm"),
									text: _i18n["default"].t("ra_Some data are not stored. Discard?"),
									ok: _i18n["default"].t("ra_Discard"),
									cancel: _i18n["default"].t("ra_Cancel"),
									onClose: function onClose(isYes) {
										return _this11.setState(
											{
												confirmClose: false,
											},
											function () {
												return isYes && GenericApp.onClose();
											},
										);
									},
								})
							: null,
					);
				},

				/**
				 * @private
				 * @param {Record<string, any>} obj
				 * @param {any} attrs
				 * @param {any} value
				 * @returns {boolean | undefined}
				 */
			},
			{
				key: "_updateNativeValue",
				value: function _updateNativeValue(obj, attrs, value) {
					if ((0, _typeof2["default"])(attrs) !== "object") {
						attrs = attrs.split(".");
					}
					var attr = attrs.shift();
					if (!attrs.length) {
						if (value && (0, _typeof2["default"])(value) === "object") {
							if (JSON.stringify(obj[attr]) !== JSON.stringify(value)) {
								obj[attr] = value;
								return true;
							}
							return false;
						}
						if (obj[attr] !== value) {
							obj[attr] = value;
							return true;
						}
						return false;
					}
					obj[attr] = obj[attr] || {};
					if ((0, _typeof2["default"])(obj[attr]) !== "object") {
						throw new Error("attribute ".concat(attr, " is no object, but ").concat((0, _typeof2["default"])(obj[attr])));
					}
					return this._updateNativeValue(obj[attr], attrs, value);
				},

				/**
				 * Update the native value
				 * @param {string} attr The attribute name with dots as delimiter.
				 * @param {any} value The new value.
				 * @param {(() => void)} [cb] Callback which will be called upon completion.
				 */
			},
			{
				key: "updateNativeValue",
				value: function updateNativeValue(attr, value, cb) {
					var _native2 = JSON.parse(JSON.stringify(this.state["native"]));
					if (this._updateNativeValue(_native2, attr, value)) {
						var changed = this.getIsChanged(_native2);
						if (changed !== this.state.changed) {
							try {
								window.parent.postMessage(changed ? "change" : "nochange", "*");
							} catch (e) {
								// ignore
							}
						}
						this.setState(
							{
								native: _native2,
								changed: changed,
							},
							cb,
						);
					}
				},

				/**
				 * Set the error text to be shown.
				 * @param {string | JSX.Element} text
				 */
			},
			{
				key: "showError",
				value: function showError(text) {
					this.setState({
						errorText: text,
					});
				},

				/**
				 * Sets the toast to be shown.
				 * @param {string} toast
				 */
			},
			{
				key: "showToast",
				value: function showToast(toast) {
					this.setState({
						toast: toast,
					});
				},

				/**
				 * Renders helper dialogs
				 * @returns {JSX.Element} The JSX element.
				 */
			},
			{
				key: "renderHelperDialogs",
				value: function renderHelperDialogs() {
					return /*#__PURE__*/ _react["default"].createElement(
						_react["default"].Fragment,
						null,
						this.renderError(),
						this.renderToast(),
						this.renderSaveCloseButtons(),
						this.renderAlertSnackbar(),
					);
				},

				/**
				 * Renders this component.
				 * @returns {JSX.Element} The JSX element.
				 */
			},
			{
				key: "render",
				value: function render() {
					if (!this.state.loaded) {
						return /*#__PURE__*/ _react["default"].createElement(_Loader["default"], {
							theme: this.state.themeType,
						});
					}
					return /*#__PURE__*/ _react["default"].createElement(
						"div",
						{
							className: "App",
						},
						this.renderError(),
						this.renderToast(),
						this.renderSaveCloseButtons(),
						this.renderAlertSnackbar(),
					);
				},
			},
		],
		[
			{
				key: "getWidth",
				value:
					/**
					 * Gets the width depending on the window inner width.
					 * @returns {import('@iobroker/adapter-react-v5/types').Width}
					 */
					function getWidth() {
						/**
						 * innerWidth |xs      sm      md      lg      xl
						 *            |-------|-------|-------|-------|------>
						 * width      |  xs   |  sm   |  md   |  lg   |  xl
						 */

						var SIZES = {
							xs: 0,
							sm: 600,
							md: 960,
							lg: 1280,
							xl: 1920,
						};
						var width = window.innerWidth;
						var keys = Object.keys(SIZES).reverse();
						var widthComputed = keys.find(function (key) {
							return width >= SIZES[key];
						});
						return widthComputed || "xs";
					},
			},
			{
				key: "onClose",
				value: function onClose() {
					if (typeof window.parent !== "undefined" && window.parent) {
						try {
							if (window.parent.$iframeDialog && typeof window.parent.$iframeDialog.close === "function") {
								window.parent.$iframeDialog.close();
							} else {
								window.parent.postMessage("close", "*");
							}
						} catch (e) {
							window.parent.postMessage("close", "*");
						}
					}
				},
			},
		],
	);
	return GenericApp;
})(_Router2["default"]);
GenericApp.propTypes = {
	adapterName: _propTypes["default"].string,
	// (optional) name of adapter
	onThemeChange: _propTypes["default"].func,
	// (optional) called by theme change
	socket: _propTypes["default"].object,
	// (optional) socket information (host, port)
	encryptedFields: _propTypes["default"].array,
	// (optional) list of native attributes that must be encrypted
	bottomButtons: _propTypes["default"].bool,
	// If the bottom buttons (Save/Close) must be shown
	Connection: _propTypes["default"].object, // If the bottom buttons (Save/Close) must be shown
};
var _default = (exports["default"] = GenericApp);
//# sourceMappingURL=GenericApp.js.map
