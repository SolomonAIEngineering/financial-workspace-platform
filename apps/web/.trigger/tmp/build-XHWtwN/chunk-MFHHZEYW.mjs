import {
  DeserializedJsonSchema,
  SerializableJsonSchema,
  VERSION,
  assertExhaustive,
  calculateRetryAt,
  context,
  deepMergeFilters,
  trace,
  z
} from "./chunk-L66UFWTU.mjs";
import {
  __commonJS,
  __toESM,
  init_esm
} from "./chunk-KZCIDQ5Y.mjs";

// ../../node_modules/.pnpm/cronstrue@2.55.0/node_modules/cronstrue/dist/cronstrue.js
var require_cronstrue = __commonJS({
  "../../node_modules/.pnpm/cronstrue@2.55.0/node_modules/cronstrue/dist/cronstrue.js"(exports, module) {
    init_esm();
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("cronstrue", [], factory);
      else if (typeof exports === "object")
        exports["cronstrue"] = factory();
      else
        root["cronstrue"] = factory();
    })(globalThis, () => {
      return (
        /******/
        (() => {
          "use strict";
          var __webpack_modules__ = {
            /***/
            949: (
              /***/
              (__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.CronParser = void 0;
                var rangeValidator_1 = __webpack_require__2(515);
                var CronParser = function() {
                  function CronParser2(expression, dayOfWeekStartIndexZero, monthStartIndexZero) {
                    if (dayOfWeekStartIndexZero === void 0) {
                      dayOfWeekStartIndexZero = true;
                    }
                    if (monthStartIndexZero === void 0) {
                      monthStartIndexZero = false;
                    }
                    this.expression = expression;
                    this.dayOfWeekStartIndexZero = dayOfWeekStartIndexZero;
                    this.monthStartIndexZero = monthStartIndexZero;
                  }
                  CronParser2.prototype.parse = function() {
                    var _a;
                    var parsed;
                    var expression = (_a = this.expression) !== null && _a !== void 0 ? _a : "";
                    if (expression.startsWith("@")) {
                      var special = this.parseSpecial(this.expression);
                      parsed = this.extractParts(special);
                    } else {
                      parsed = this.extractParts(this.expression);
                    }
                    this.normalize(parsed);
                    this.validate(parsed);
                    return parsed;
                  };
                  CronParser2.prototype.parseSpecial = function(expression) {
                    var specialExpressions = {
                      "@yearly": "0 0 1 1 *",
                      "@annually": "0 0 1 1 *",
                      "@monthly": "0 0 1 * *",
                      "@weekly": "0 0 * * 0",
                      "@daily": "0 0 * * *",
                      "@midnight": "0 0 * * *",
                      "@hourly": "0 * * * *"
                    };
                    var special = specialExpressions[expression];
                    if (!special) {
                      throw new Error("Unknown special expression.");
                    }
                    return special;
                  };
                  CronParser2.prototype.extractParts = function(expression) {
                    if (!this.expression) {
                      throw new Error("cron expression is empty");
                    }
                    var parsed = expression.trim().split(/[ ]+/);
                    for (var i = 0; i < parsed.length; i++) {
                      if (parsed[i].includes(",")) {
                        var arrayElement = parsed[i].split(",").map(function(item) {
                          return item.trim();
                        }).filter(function(item) {
                          return item !== "";
                        }).map(function(item) {
                          return !isNaN(Number(item)) ? Number(item) : item;
                        }).filter(function(item) {
                          return item !== null && item !== "";
                        });
                        if (arrayElement.length === 0) {
                          arrayElement.push("*");
                        }
                        arrayElement.sort(function(a, b) {
                          return a !== null && b !== null ? a - b : 0;
                        });
                        parsed[i] = arrayElement.map(function(item) {
                          return item !== null ? item.toString() : "";
                        }).join(",");
                      }
                    }
                    if (parsed.length < 5) {
                      throw new Error("Expression has only ".concat(parsed.length, " part").concat(parsed.length == 1 ? "" : "s", ". At least 5 parts are required."));
                    } else if (parsed.length == 5) {
                      parsed.unshift("");
                      parsed.push("");
                    } else if (parsed.length == 6) {
                      var isYearWithNoSecondsPart = /\d{4}$/.test(parsed[5]) || parsed[4] == "?" || parsed[2] == "?";
                      if (isYearWithNoSecondsPart) {
                        parsed.unshift("");
                      } else {
                        parsed.push("");
                      }
                    } else if (parsed.length > 7) {
                      throw new Error("Expression has ".concat(parsed.length, " parts; too many!"));
                    }
                    return parsed;
                  };
                  CronParser2.prototype.normalize = function(expressionParts) {
                    var _this = this;
                    expressionParts[3] = expressionParts[3].replace("?", "*");
                    expressionParts[5] = expressionParts[5].replace("?", "*");
                    expressionParts[2] = expressionParts[2].replace("?", "*");
                    if (expressionParts[0].indexOf("0/") == 0) {
                      expressionParts[0] = expressionParts[0].replace("0/", "*/");
                    }
                    if (expressionParts[1].indexOf("0/") == 0) {
                      expressionParts[1] = expressionParts[1].replace("0/", "*/");
                    }
                    if (expressionParts[2].indexOf("0/") == 0) {
                      expressionParts[2] = expressionParts[2].replace("0/", "*/");
                    }
                    if (expressionParts[3].indexOf("1/") == 0) {
                      expressionParts[3] = expressionParts[3].replace("1/", "*/");
                    }
                    if (expressionParts[4].indexOf("1/") == 0) {
                      expressionParts[4] = expressionParts[4].replace("1/", "*/");
                    }
                    if (expressionParts[6].indexOf("1/") == 0) {
                      expressionParts[6] = expressionParts[6].replace("1/", "*/");
                    }
                    expressionParts[5] = expressionParts[5].replace(/(^\d)|([^#/\s]\d)/g, function(t) {
                      var dowDigits = t.replace(/\D/, "");
                      var dowDigitsAdjusted = dowDigits;
                      if (_this.dayOfWeekStartIndexZero) {
                        if (dowDigits == "7") {
                          dowDigitsAdjusted = "0";
                        }
                      } else {
                        dowDigitsAdjusted = (parseInt(dowDigits) - 1).toString();
                      }
                      return t.replace(dowDigits, dowDigitsAdjusted);
                    });
                    if (expressionParts[5] == "L") {
                      expressionParts[5] = "6";
                    }
                    if (expressionParts[3] == "?") {
                      expressionParts[3] = "*";
                    }
                    if (expressionParts[3].indexOf("W") > -1 && (expressionParts[3].indexOf(",") > -1 || expressionParts[3].indexOf("-") > -1)) {
                      throw new Error("The 'W' character can be specified only when the day-of-month is a single day, not a range or list of days.");
                    }
                    var days = {
                      SUN: 0,
                      MON: 1,
                      TUE: 2,
                      WED: 3,
                      THU: 4,
                      FRI: 5,
                      SAT: 6
                    };
                    for (var day in days) {
                      expressionParts[5] = expressionParts[5].replace(new RegExp(day, "gi"), days[day].toString());
                    }
                    expressionParts[4] = expressionParts[4].replace(/(^\d{1,2})|([^#/\s]\d{1,2})/g, function(t) {
                      var dowDigits = t.replace(/\D/, "");
                      var dowDigitsAdjusted = dowDigits;
                      if (_this.monthStartIndexZero) {
                        dowDigitsAdjusted = (parseInt(dowDigits) + 1).toString();
                      }
                      return t.replace(dowDigits, dowDigitsAdjusted);
                    });
                    var months = {
                      JAN: 1,
                      FEB: 2,
                      MAR: 3,
                      APR: 4,
                      MAY: 5,
                      JUN: 6,
                      JUL: 7,
                      AUG: 8,
                      SEP: 9,
                      OCT: 10,
                      NOV: 11,
                      DEC: 12
                    };
                    for (var month in months) {
                      expressionParts[4] = expressionParts[4].replace(new RegExp(month, "gi"), months[month].toString());
                    }
                    if (expressionParts[0] == "0") {
                      expressionParts[0] = "";
                    }
                    if (!/\*|\-|\,|\//.test(expressionParts[2]) && (/\*|\//.test(expressionParts[1]) || /\*|\//.test(expressionParts[0]))) {
                      expressionParts[2] += "-".concat(expressionParts[2]);
                    }
                    for (var i = 0; i < expressionParts.length; i++) {
                      if (expressionParts[i].indexOf(",") != -1) {
                        expressionParts[i] = expressionParts[i].split(",").filter(function(str) {
                          return str !== "";
                        }).join(",") || "*";
                      }
                      if (expressionParts[i] == "*/1") {
                        expressionParts[i] = "*";
                      }
                      if (expressionParts[i].indexOf("/") > -1 && !/^\*|\-|\,/.test(expressionParts[i])) {
                        var stepRangeThrough = null;
                        switch (i) {
                          case 4:
                            stepRangeThrough = "12";
                            break;
                          case 5:
                            stepRangeThrough = "6";
                            break;
                          case 6:
                            stepRangeThrough = "9999";
                            break;
                          default:
                            stepRangeThrough = null;
                            break;
                        }
                        if (stepRangeThrough !== null) {
                          var parts = expressionParts[i].split("/");
                          expressionParts[i] = "".concat(parts[0], "-").concat(stepRangeThrough, "/").concat(parts[1]);
                        }
                      }
                    }
                  };
                  CronParser2.prototype.validate = function(parsed) {
                    var standardCronPartCharacters = "0-9,\\-*/";
                    this.validateOnlyExpectedCharactersFound(parsed[0], standardCronPartCharacters);
                    this.validateOnlyExpectedCharactersFound(parsed[1], standardCronPartCharacters);
                    this.validateOnlyExpectedCharactersFound(parsed[2], standardCronPartCharacters);
                    this.validateOnlyExpectedCharactersFound(parsed[3], "0-9,\\-*/LW");
                    this.validateOnlyExpectedCharactersFound(parsed[4], standardCronPartCharacters);
                    this.validateOnlyExpectedCharactersFound(parsed[5], "0-9,\\-*/L#");
                    this.validateOnlyExpectedCharactersFound(parsed[6], standardCronPartCharacters);
                    this.validateAnyRanges(parsed);
                  };
                  CronParser2.prototype.validateAnyRanges = function(parsed) {
                    rangeValidator_1.default.secondRange(parsed[0]);
                    rangeValidator_1.default.minuteRange(parsed[1]);
                    rangeValidator_1.default.hourRange(parsed[2]);
                    rangeValidator_1.default.dayOfMonthRange(parsed[3]);
                    rangeValidator_1.default.monthRange(parsed[4], this.monthStartIndexZero);
                    rangeValidator_1.default.dayOfWeekRange(parsed[5], this.dayOfWeekStartIndexZero);
                  };
                  CronParser2.prototype.validateOnlyExpectedCharactersFound = function(cronPart, allowedCharsExpression) {
                    var invalidChars = cronPart.match(new RegExp("[^".concat(allowedCharsExpression, "]+"), "gi"));
                    if (invalidChars && invalidChars.length) {
                      throw new Error("Expression contains invalid values: '".concat(invalidChars.toString(), "'"));
                    }
                  };
                  return CronParser2;
                }();
                exports2.CronParser = CronParser;
              }
            ),
            /***/
            333: (
              /***/
              (__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.ExpressionDescriptor = void 0;
                var stringUtilities_1 = __webpack_require__2(823);
                var cronParser_1 = __webpack_require__2(949);
                var ExpressionDescriptor = function() {
                  function ExpressionDescriptor2(expression, options) {
                    this.expression = expression;
                    this.options = options;
                    this.expressionParts = new Array(5);
                    if (!this.options.locale && ExpressionDescriptor2.defaultLocale) {
                      this.options.locale = ExpressionDescriptor2.defaultLocale;
                    }
                    if (!ExpressionDescriptor2.locales[this.options.locale]) {
                      var fallBackLocale = Object.keys(ExpressionDescriptor2.locales)[0];
                      console.warn("Locale '".concat(this.options.locale, "' could not be found; falling back to '").concat(fallBackLocale, "'."));
                      this.options.locale = fallBackLocale;
                    }
                    this.i18n = ExpressionDescriptor2.locales[this.options.locale];
                    if (options.use24HourTimeFormat === void 0) {
                      options.use24HourTimeFormat = this.i18n.use24HourTimeFormatByDefault();
                    }
                  }
                  ExpressionDescriptor2.toString = function(expression, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.throwExceptionOnParseError, throwExceptionOnParseError = _c === void 0 ? true : _c, _d = _b.verbose, verbose = _d === void 0 ? false : _d, _e = _b.dayOfWeekStartIndexZero, dayOfWeekStartIndexZero = _e === void 0 ? true : _e, _f = _b.monthStartIndexZero, monthStartIndexZero = _f === void 0 ? false : _f, use24HourTimeFormat = _b.use24HourTimeFormat, _g = _b.locale, locale = _g === void 0 ? null : _g, _h = _b.tzOffset, tzOffset = _h === void 0 ? 0 : _h;
                    var options = {
                      throwExceptionOnParseError,
                      verbose,
                      dayOfWeekStartIndexZero,
                      monthStartIndexZero,
                      use24HourTimeFormat,
                      locale,
                      tzOffset
                    };
                    if (options.tzOffset) {
                      console.warn("'tzOffset' option has been deprecated and will be removed in a future release.");
                    }
                    var descripter = new ExpressionDescriptor2(expression, options);
                    return descripter.getFullDescription();
                  };
                  ExpressionDescriptor2.initialize = function(localesLoader, defaultLocale) {
                    if (defaultLocale === void 0) {
                      defaultLocale = "en";
                    }
                    ExpressionDescriptor2.specialCharacters = ["/", "-", ",", "*"];
                    ExpressionDescriptor2.defaultLocale = defaultLocale;
                    localesLoader.load(ExpressionDescriptor2.locales);
                  };
                  ExpressionDescriptor2.prototype.getFullDescription = function() {
                    var description = "";
                    try {
                      var parser = new cronParser_1.CronParser(this.expression, this.options.dayOfWeekStartIndexZero, this.options.monthStartIndexZero);
                      this.expressionParts = parser.parse();
                      var timeSegment = this.getTimeOfDayDescription();
                      var dayOfMonthDesc = this.getDayOfMonthDescription();
                      var monthDesc = this.getMonthDescription();
                      var dayOfWeekDesc = this.getDayOfWeekDescription();
                      var yearDesc = this.getYearDescription();
                      description += timeSegment + dayOfMonthDesc + dayOfWeekDesc + monthDesc + yearDesc;
                      description = this.transformVerbosity(description, !!this.options.verbose);
                      description = description.charAt(0).toLocaleUpperCase() + description.substr(1);
                    } catch (ex) {
                      if (!this.options.throwExceptionOnParseError) {
                        description = this.i18n.anErrorOccuredWhenGeneratingTheExpressionD();
                      } else {
                        throw "".concat(ex);
                      }
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getTimeOfDayDescription = function() {
                    var secondsExpression = this.expressionParts[0];
                    var minuteExpression = this.expressionParts[1];
                    var hourExpression = this.expressionParts[2];
                    var description = "";
                    if (!stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor2.specialCharacters) && !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor2.specialCharacters) && !stringUtilities_1.StringUtilities.containsAny(secondsExpression, ExpressionDescriptor2.specialCharacters)) {
                      description += this.i18n.atSpace() + this.formatTime(hourExpression, minuteExpression, secondsExpression);
                    } else if (!secondsExpression && minuteExpression.indexOf("-") > -1 && !(minuteExpression.indexOf(",") > -1) && !(minuteExpression.indexOf("/") > -1) && !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor2.specialCharacters)) {
                      var minuteParts = minuteExpression.split("-");
                      description += stringUtilities_1.StringUtilities.format(this.i18n.everyMinuteBetweenX0AndX1(), this.formatTime(hourExpression, minuteParts[0], ""), this.formatTime(hourExpression, minuteParts[1], ""));
                    } else if (!secondsExpression && hourExpression.indexOf(",") > -1 && hourExpression.indexOf("-") == -1 && hourExpression.indexOf("/") == -1 && !stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor2.specialCharacters)) {
                      var hourParts = hourExpression.split(",");
                      description += this.i18n.at();
                      for (var i = 0; i < hourParts.length; i++) {
                        description += " ";
                        description += this.formatTime(hourParts[i], minuteExpression, "");
                        if (i < hourParts.length - 2) {
                          description += ",";
                        }
                        if (i == hourParts.length - 2) {
                          description += this.i18n.spaceAnd();
                        }
                      }
                    } else {
                      var secondsDescription = this.getSecondsDescription();
                      var minutesDescription = this.getMinutesDescription();
                      var hoursDescription = this.getHoursDescription();
                      description += secondsDescription;
                      if (description && minutesDescription) {
                        description += ", ";
                      }
                      description += minutesDescription;
                      if (minutesDescription === hoursDescription) {
                        return description;
                      }
                      if (description && hoursDescription) {
                        description += ", ";
                      }
                      description += hoursDescription;
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getSecondsDescription = function() {
                    var _this = this;
                    var description = this.getSegmentDescription(this.expressionParts[0], this.i18n.everySecond(), function(s) {
                      return s;
                    }, function(s) {
                      return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Seconds(s), s);
                    }, function(s) {
                      return _this.i18n.secondsX0ThroughX1PastTheMinute();
                    }, function(s) {
                      return s == "0" ? "" : parseInt(s) < 20 ? _this.i18n.atX0SecondsPastTheMinute(s) : _this.i18n.atX0SecondsPastTheMinuteGt20() || _this.i18n.atX0SecondsPastTheMinute(s);
                    });
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getMinutesDescription = function() {
                    var _this = this;
                    var secondsExpression = this.expressionParts[0];
                    var hourExpression = this.expressionParts[2];
                    var description = this.getSegmentDescription(this.expressionParts[1], this.i18n.everyMinute(), function(s) {
                      return s;
                    }, function(s) {
                      return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Minutes(s), s);
                    }, function(s) {
                      return _this.i18n.minutesX0ThroughX1PastTheHour();
                    }, function(s) {
                      try {
                        return s == "0" && hourExpression.indexOf("/") == -1 && secondsExpression == "" ? _this.i18n.everyHour() : parseInt(s) < 20 ? _this.i18n.atX0MinutesPastTheHour(s) : _this.i18n.atX0MinutesPastTheHourGt20() || _this.i18n.atX0MinutesPastTheHour(s);
                      } catch (e) {
                        return _this.i18n.atX0MinutesPastTheHour(s);
                      }
                    });
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getHoursDescription = function() {
                    var _this = this;
                    var expression = this.expressionParts[2];
                    var description = this.getSegmentDescription(expression, this.i18n.everyHour(), function(s) {
                      return _this.formatTime(s, "0", "");
                    }, function(s) {
                      return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Hours(s), s);
                    }, function(s) {
                      return _this.i18n.betweenX0AndX1();
                    }, function(s) {
                      return _this.i18n.atX0();
                    });
                    if (description && expression.includes("-") && this.expressionParts[1] != "0") {
                      var atTheHourMatches = Array.from(description.matchAll(/:00/g));
                      if (atTheHourMatches.length > 1) {
                        var lastAtTheHourMatchIndex = atTheHourMatches[atTheHourMatches.length - 1].index;
                        description = description.substring(0, lastAtTheHourMatchIndex) + ":59" + description.substring(lastAtTheHourMatchIndex + 3);
                      }
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getDayOfWeekDescription = function() {
                    var _this = this;
                    var daysOfWeekNames = this.i18n.daysOfTheWeek();
                    var description = null;
                    if (this.expressionParts[5] == "*") {
                      description = "";
                    } else {
                      description = this.getSegmentDescription(this.expressionParts[5], this.i18n.commaEveryDay(), function(s, form) {
                        var exp = s;
                        if (s.indexOf("#") > -1) {
                          exp = s.substring(0, s.indexOf("#"));
                        } else if (s.indexOf("L") > -1) {
                          exp = exp.replace("L", "");
                        }
                        var parsedExp = parseInt(exp);
                        if (_this.options.tzOffset) {
                          var hourExpression = _this.expressionParts[2];
                          var hour = parseInt(hourExpression) + (_this.options.tzOffset ? _this.options.tzOffset : 0);
                          if (hour >= 24) {
                            parsedExp++;
                          } else if (hour < 0) {
                            parsedExp--;
                          }
                          if (parsedExp > 6) {
                            parsedExp = 0;
                          } else if (parsedExp < 0) {
                            parsedExp = 6;
                          }
                        }
                        var description2 = _this.i18n.daysOfTheWeekInCase ? _this.i18n.daysOfTheWeekInCase(form)[parsedExp] : daysOfWeekNames[parsedExp];
                        if (s.indexOf("#") > -1) {
                          var dayOfWeekOfMonthDescription = null;
                          var dayOfWeekOfMonthNumber = s.substring(s.indexOf("#") + 1);
                          var dayOfWeekNumber = s.substring(0, s.indexOf("#"));
                          switch (dayOfWeekOfMonthNumber) {
                            case "1":
                              dayOfWeekOfMonthDescription = _this.i18n.first(dayOfWeekNumber);
                              break;
                            case "2":
                              dayOfWeekOfMonthDescription = _this.i18n.second(dayOfWeekNumber);
                              break;
                            case "3":
                              dayOfWeekOfMonthDescription = _this.i18n.third(dayOfWeekNumber);
                              break;
                            case "4":
                              dayOfWeekOfMonthDescription = _this.i18n.fourth(dayOfWeekNumber);
                              break;
                            case "5":
                              dayOfWeekOfMonthDescription = _this.i18n.fifth(dayOfWeekNumber);
                              break;
                          }
                          description2 = dayOfWeekOfMonthDescription + " " + description2;
                        }
                        return description2;
                      }, function(s) {
                        if (parseInt(s) == 1) {
                          return "";
                        } else {
                          return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0DaysOfTheWeek(s), s);
                        }
                      }, function(s) {
                        var beginFrom = s.substring(0, s.indexOf("-"));
                        var domSpecified = _this.expressionParts[3] != "*";
                        return domSpecified ? _this.i18n.commaAndX0ThroughX1(beginFrom) : _this.i18n.commaX0ThroughX1(beginFrom);
                      }, function(s) {
                        var format = null;
                        if (s.indexOf("#") > -1) {
                          var dayOfWeekOfMonthNumber = s.substring(s.indexOf("#") + 1);
                          var dayOfWeek = s.substring(0, s.indexOf("#"));
                          format = _this.i18n.commaOnThe(dayOfWeekOfMonthNumber, dayOfWeek).trim() + _this.i18n.spaceX0OfTheMonth();
                        } else if (s.indexOf("L") > -1) {
                          format = _this.i18n.commaOnTheLastX0OfTheMonth(s.replace("L", ""));
                        } else {
                          var domSpecified = _this.expressionParts[3] != "*";
                          format = domSpecified ? _this.i18n.commaAndOnX0() : _this.i18n.commaOnlyOnX0(s);
                        }
                        return format;
                      });
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getMonthDescription = function() {
                    var _this = this;
                    var monthNames = this.i18n.monthsOfTheYear();
                    var description = this.getSegmentDescription(this.expressionParts[4], "", function(s, form) {
                      return form && _this.i18n.monthsOfTheYearInCase ? _this.i18n.monthsOfTheYearInCase(form)[parseInt(s) - 1] : monthNames[parseInt(s) - 1];
                    }, function(s) {
                      if (parseInt(s) == 1) {
                        return "";
                      } else {
                        return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Months(s), s);
                      }
                    }, function(s) {
                      return _this.i18n.commaMonthX0ThroughMonthX1() || _this.i18n.commaX0ThroughX1();
                    }, function(s) {
                      return _this.i18n.commaOnlyInMonthX0 ? _this.i18n.commaOnlyInMonthX0() : _this.i18n.commaOnlyInX0();
                    });
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getDayOfMonthDescription = function() {
                    var _this = this;
                    var description = null;
                    var expression = this.expressionParts[3];
                    switch (expression) {
                      case "L":
                        description = this.i18n.commaOnTheLastDayOfTheMonth();
                        break;
                      case "WL":
                      case "LW":
                        description = this.i18n.commaOnTheLastWeekdayOfTheMonth();
                        break;
                      default:
                        var weekDayNumberMatches = expression.match(/(\d{1,2}W)|(W\d{1,2})/);
                        if (weekDayNumberMatches) {
                          var dayNumber = parseInt(weekDayNumberMatches[0].replace("W", ""));
                          var dayString = dayNumber == 1 ? this.i18n.firstWeekday() : stringUtilities_1.StringUtilities.format(this.i18n.weekdayNearestDayX0(), dayNumber.toString());
                          description = stringUtilities_1.StringUtilities.format(this.i18n.commaOnTheX0OfTheMonth(), dayString);
                          break;
                        } else {
                          var lastDayOffSetMatches = expression.match(/L-(\d{1,2})/);
                          if (lastDayOffSetMatches) {
                            var offSetDays = lastDayOffSetMatches[1];
                            description = stringUtilities_1.StringUtilities.format(this.i18n.commaDaysBeforeTheLastDayOfTheMonth(offSetDays), offSetDays);
                            break;
                          } else if (expression == "*" && this.expressionParts[5] != "*") {
                            return "";
                          } else {
                            description = this.getSegmentDescription(expression, this.i18n.commaEveryDay(), function(s) {
                              return s == "L" ? _this.i18n.lastDay() : _this.i18n.dayX0 ? stringUtilities_1.StringUtilities.format(_this.i18n.dayX0(), s) : s;
                            }, function(s) {
                              return s == "1" ? _this.i18n.commaEveryDay() : _this.i18n.commaEveryX0Days(s);
                            }, function(s) {
                              return _this.i18n.commaBetweenDayX0AndX1OfTheMonth(s);
                            }, function(s) {
                              return _this.i18n.commaOnDayX0OfTheMonth(s);
                            });
                          }
                          break;
                        }
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getYearDescription = function() {
                    var _this = this;
                    var description = this.getSegmentDescription(this.expressionParts[6], "", function(s) {
                      return /^\d+$/.test(s) ? new Date(parseInt(s), 1).getFullYear().toString() : s;
                    }, function(s) {
                      return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Years(s), s);
                    }, function(s) {
                      return _this.i18n.commaYearX0ThroughYearX1() || _this.i18n.commaX0ThroughX1();
                    }, function(s) {
                      return _this.i18n.commaOnlyInYearX0 ? _this.i18n.commaOnlyInYearX0() : _this.i18n.commaOnlyInX0();
                    });
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getSegmentDescription = function(expression, allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat) {
                    var description = null;
                    var doesExpressionContainIncrement = expression.indexOf("/") > -1;
                    var doesExpressionContainRange = expression.indexOf("-") > -1;
                    var doesExpressionContainMultipleValues = expression.indexOf(",") > -1;
                    if (!expression) {
                      description = "";
                    } else if (expression === "*") {
                      description = allDescription;
                    } else if (!doesExpressionContainIncrement && !doesExpressionContainRange && !doesExpressionContainMultipleValues) {
                      description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), getSingleItemDescription(expression));
                    } else if (doesExpressionContainMultipleValues) {
                      var segments = expression.split(",");
                      var descriptionContent = "";
                      for (var i = 0; i < segments.length; i++) {
                        if (i > 0 && segments.length > 2) {
                          descriptionContent += ",";
                          if (i < segments.length - 1) {
                            descriptionContent += " ";
                          }
                        }
                        if (i > 0 && segments.length > 1 && (i == segments.length - 1 || segments.length == 2)) {
                          descriptionContent += "".concat(this.i18n.spaceAnd(), " ");
                        }
                        if (segments[i].indexOf("/") > -1 || segments[i].indexOf("-") > -1) {
                          var isSegmentRangeWithoutIncrement = segments[i].indexOf("-") > -1 && segments[i].indexOf("/") == -1;
                          var currentDescriptionContent = this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, isSegmentRangeWithoutIncrement ? this.i18n.commaX0ThroughX1 : getRangeDescriptionFormat, getDescriptionFormat);
                          if (isSegmentRangeWithoutIncrement) {
                            currentDescriptionContent = currentDescriptionContent.replace(", ", "");
                          }
                          descriptionContent += currentDescriptionContent;
                        } else if (!doesExpressionContainIncrement) {
                          descriptionContent += getSingleItemDescription(segments[i]);
                        } else {
                          descriptionContent += this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat);
                        }
                      }
                      if (!doesExpressionContainIncrement) {
                        description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), descriptionContent);
                      } else {
                        description = descriptionContent;
                      }
                    } else if (doesExpressionContainIncrement) {
                      var segments = expression.split("/");
                      description = stringUtilities_1.StringUtilities.format(getIncrementDescriptionFormat(segments[1]), segments[1]);
                      if (segments[0].indexOf("-") > -1) {
                        var rangeSegmentDescription = this.generateRangeSegmentDescription(segments[0], getRangeDescriptionFormat, getSingleItemDescription);
                        if (rangeSegmentDescription.indexOf(", ") != 0) {
                          description += ", ";
                        }
                        description += rangeSegmentDescription;
                      } else if (segments[0].indexOf("*") == -1) {
                        var rangeItemDescription = stringUtilities_1.StringUtilities.format(getDescriptionFormat(segments[0]), getSingleItemDescription(segments[0]));
                        rangeItemDescription = rangeItemDescription.replace(", ", "");
                        description += stringUtilities_1.StringUtilities.format(this.i18n.commaStartingX0(), rangeItemDescription);
                      }
                    } else if (doesExpressionContainRange) {
                      description = this.generateRangeSegmentDescription(expression, getRangeDescriptionFormat, getSingleItemDescription);
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.generateRangeSegmentDescription = function(rangeExpression, getRangeDescriptionFormat, getSingleItemDescription) {
                    var description = "";
                    var rangeSegments = rangeExpression.split("-");
                    var rangeSegment1Description = getSingleItemDescription(rangeSegments[0], 1);
                    var rangeSegment2Description = getSingleItemDescription(rangeSegments[1], 2);
                    var rangeDescriptionFormat = getRangeDescriptionFormat(rangeExpression);
                    description += stringUtilities_1.StringUtilities.format(rangeDescriptionFormat, rangeSegment1Description, rangeSegment2Description);
                    return description;
                  };
                  ExpressionDescriptor2.prototype.formatTime = function(hourExpression, minuteExpression, secondExpression) {
                    var hourOffset = 0;
                    var minuteOffset = 0;
                    if (this.options.tzOffset) {
                      hourOffset = this.options.tzOffset > 0 ? Math.floor(this.options.tzOffset) : Math.ceil(this.options.tzOffset);
                      minuteOffset = parseFloat((this.options.tzOffset % 1).toFixed(2));
                      if (minuteOffset != 0) {
                        minuteOffset *= 60;
                      }
                    }
                    var hour = parseInt(hourExpression) + hourOffset;
                    var minute = parseInt(minuteExpression) + minuteOffset;
                    if (minute >= 60) {
                      minute -= 60;
                      hour += 1;
                    } else if (minute < 0) {
                      minute += 60;
                      hour -= 1;
                    }
                    if (hour >= 24) {
                      hour = hour - 24;
                    } else if (hour < 0) {
                      hour = 24 + hour;
                    }
                    var period = "";
                    var setPeriodBeforeTime = false;
                    if (!this.options.use24HourTimeFormat) {
                      setPeriodBeforeTime = !!(this.i18n.setPeriodBeforeTime && this.i18n.setPeriodBeforeTime());
                      period = setPeriodBeforeTime ? "".concat(this.getPeriod(hour), " ") : " ".concat(this.getPeriod(hour));
                      if (hour > 12) {
                        hour -= 12;
                      }
                      if (hour === 0) {
                        hour = 12;
                      }
                    }
                    var second = "";
                    if (secondExpression) {
                      second = ":".concat(("00" + secondExpression).substring(secondExpression.length));
                    }
                    return "".concat(setPeriodBeforeTime ? period : "").concat(("00" + hour.toString()).substring(hour.toString().length), ":").concat(("00" + minute.toString()).substring(minute.toString().length)).concat(second).concat(!setPeriodBeforeTime ? period : "");
                  };
                  ExpressionDescriptor2.prototype.transformVerbosity = function(description, useVerboseFormat) {
                    if (!useVerboseFormat) {
                      description = description.replace(new RegExp(", ".concat(this.i18n.everyMinute()), "g"), "");
                      description = description.replace(new RegExp(", ".concat(this.i18n.everyHour()), "g"), "");
                      description = description.replace(new RegExp(this.i18n.commaEveryDay(), "g"), "");
                      description = description.replace(/\, ?$/, "");
                    }
                    return description;
                  };
                  ExpressionDescriptor2.prototype.getPeriod = function(hour) {
                    return hour >= 12 ? this.i18n.pm && this.i18n.pm() || "PM" : this.i18n.am && this.i18n.am() || "AM";
                  };
                  ExpressionDescriptor2.locales = {};
                  return ExpressionDescriptor2;
                }();
                exports2.ExpressionDescriptor = ExpressionDescriptor;
              }
            ),
            /***/
            747: (
              /***/
              (__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.enLocaleLoader = void 0;
                var en_1 = __webpack_require__2(486);
                var enLocaleLoader = function() {
                  function enLocaleLoader2() {
                  }
                  enLocaleLoader2.prototype.load = function(availableLocales) {
                    availableLocales["en"] = new en_1.en();
                  };
                  return enLocaleLoader2;
                }();
                exports2.enLocaleLoader = enLocaleLoader;
              }
            ),
            /***/
            486: (
              /***/
              (__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.en = void 0;
                var en = function() {
                  function en2() {
                  }
                  en2.prototype.atX0SecondsPastTheMinuteGt20 = function() {
                    return null;
                  };
                  en2.prototype.atX0MinutesPastTheHourGt20 = function() {
                    return null;
                  };
                  en2.prototype.commaMonthX0ThroughMonthX1 = function() {
                    return null;
                  };
                  en2.prototype.commaYearX0ThroughYearX1 = function() {
                    return null;
                  };
                  en2.prototype.use24HourTimeFormatByDefault = function() {
                    return false;
                  };
                  en2.prototype.anErrorOccuredWhenGeneratingTheExpressionD = function() {
                    return "An error occured when generating the expression description.  Check the cron expression syntax.";
                  };
                  en2.prototype.everyMinute = function() {
                    return "every minute";
                  };
                  en2.prototype.everyHour = function() {
                    return "every hour";
                  };
                  en2.prototype.atSpace = function() {
                    return "At ";
                  };
                  en2.prototype.everyMinuteBetweenX0AndX1 = function() {
                    return "Every minute between %s and %s";
                  };
                  en2.prototype.at = function() {
                    return "At";
                  };
                  en2.prototype.spaceAnd = function() {
                    return " and";
                  };
                  en2.prototype.everySecond = function() {
                    return "every second";
                  };
                  en2.prototype.everyX0Seconds = function() {
                    return "every %s seconds";
                  };
                  en2.prototype.secondsX0ThroughX1PastTheMinute = function() {
                    return "seconds %s through %s past the minute";
                  };
                  en2.prototype.atX0SecondsPastTheMinute = function() {
                    return "at %s seconds past the minute";
                  };
                  en2.prototype.everyX0Minutes = function() {
                    return "every %s minutes";
                  };
                  en2.prototype.minutesX0ThroughX1PastTheHour = function() {
                    return "minutes %s through %s past the hour";
                  };
                  en2.prototype.atX0MinutesPastTheHour = function() {
                    return "at %s minutes past the hour";
                  };
                  en2.prototype.everyX0Hours = function() {
                    return "every %s hours";
                  };
                  en2.prototype.betweenX0AndX1 = function() {
                    return "between %s and %s";
                  };
                  en2.prototype.atX0 = function() {
                    return "at %s";
                  };
                  en2.prototype.commaEveryDay = function() {
                    return ", every day";
                  };
                  en2.prototype.commaEveryX0DaysOfTheWeek = function() {
                    return ", every %s days of the week";
                  };
                  en2.prototype.commaX0ThroughX1 = function() {
                    return ", %s through %s";
                  };
                  en2.prototype.commaAndX0ThroughX1 = function() {
                    return ", %s through %s";
                  };
                  en2.prototype.first = function() {
                    return "first";
                  };
                  en2.prototype.second = function() {
                    return "second";
                  };
                  en2.prototype.third = function() {
                    return "third";
                  };
                  en2.prototype.fourth = function() {
                    return "fourth";
                  };
                  en2.prototype.fifth = function() {
                    return "fifth";
                  };
                  en2.prototype.commaOnThe = function() {
                    return ", on the ";
                  };
                  en2.prototype.spaceX0OfTheMonth = function() {
                    return " %s of the month";
                  };
                  en2.prototype.lastDay = function() {
                    return "the last day";
                  };
                  en2.prototype.commaOnTheLastX0OfTheMonth = function() {
                    return ", on the last %s of the month";
                  };
                  en2.prototype.commaOnlyOnX0 = function() {
                    return ", only on %s";
                  };
                  en2.prototype.commaAndOnX0 = function() {
                    return ", and on %s";
                  };
                  en2.prototype.commaEveryX0Months = function() {
                    return ", every %s months";
                  };
                  en2.prototype.commaOnlyInX0 = function() {
                    return ", only in %s";
                  };
                  en2.prototype.commaOnTheLastDayOfTheMonth = function() {
                    return ", on the last day of the month";
                  };
                  en2.prototype.commaOnTheLastWeekdayOfTheMonth = function() {
                    return ", on the last weekday of the month";
                  };
                  en2.prototype.commaDaysBeforeTheLastDayOfTheMonth = function() {
                    return ", %s days before the last day of the month";
                  };
                  en2.prototype.firstWeekday = function() {
                    return "first weekday";
                  };
                  en2.prototype.weekdayNearestDayX0 = function() {
                    return "weekday nearest day %s";
                  };
                  en2.prototype.commaOnTheX0OfTheMonth = function() {
                    return ", on the %s of the month";
                  };
                  en2.prototype.commaEveryX0Days = function() {
                    return ", every %s days";
                  };
                  en2.prototype.commaBetweenDayX0AndX1OfTheMonth = function() {
                    return ", between day %s and %s of the month";
                  };
                  en2.prototype.commaOnDayX0OfTheMonth = function() {
                    return ", on day %s of the month";
                  };
                  en2.prototype.commaEveryHour = function() {
                    return ", every hour";
                  };
                  en2.prototype.commaEveryX0Years = function() {
                    return ", every %s years";
                  };
                  en2.prototype.commaStartingX0 = function() {
                    return ", starting %s";
                  };
                  en2.prototype.daysOfTheWeek = function() {
                    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  };
                  en2.prototype.monthsOfTheYear = function() {
                    return [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December"
                    ];
                  };
                  return en2;
                }();
                exports2.en = en;
              }
            ),
            /***/
            515: (
              /***/
              (__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                function assert(value, message) {
                  if (!value) {
                    throw new Error(message);
                  }
                }
                var RangeValidator = function() {
                  function RangeValidator2() {
                  }
                  RangeValidator2.secondRange = function(parse) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var second = parseInt(parsed[i], 10);
                        assert(second >= 0 && second <= 59, "seconds part must be >= 0 and <= 59");
                      }
                    }
                  };
                  RangeValidator2.minuteRange = function(parse) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var minute = parseInt(parsed[i], 10);
                        assert(minute >= 0 && minute <= 59, "minutes part must be >= 0 and <= 59");
                      }
                    }
                  };
                  RangeValidator2.hourRange = function(parse) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var hour = parseInt(parsed[i], 10);
                        assert(hour >= 0 && hour <= 23, "hours part must be >= 0 and <= 23");
                      }
                    }
                  };
                  RangeValidator2.dayOfMonthRange = function(parse) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var dayOfMonth = parseInt(parsed[i], 10);
                        assert(dayOfMonth >= 1 && dayOfMonth <= 31, "DOM part must be >= 1 and <= 31");
                      }
                    }
                  };
                  RangeValidator2.monthRange = function(parse, monthStartIndexZero) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var month = parseInt(parsed[i], 10);
                        assert(month >= 1 && month <= 12, monthStartIndexZero ? "month part must be >= 0 and <= 11" : "month part must be >= 1 and <= 12");
                      }
                    }
                  };
                  RangeValidator2.dayOfWeekRange = function(parse, dayOfWeekStartIndexZero) {
                    var parsed = parse.split(",");
                    for (var i = 0; i < parsed.length; i++) {
                      if (!isNaN(parseInt(parsed[i], 10))) {
                        var dayOfWeek = parseInt(parsed[i], 10);
                        assert(dayOfWeek >= 0 && dayOfWeek <= 6, dayOfWeekStartIndexZero ? "DOW part must be >= 0 and <= 6" : "DOW part must be >= 1 and <= 7");
                      }
                    }
                  };
                  return RangeValidator2;
                }();
                exports2["default"] = RangeValidator;
              }
            ),
            /***/
            823: (
              /***/
              (__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.StringUtilities = void 0;
                var StringUtilities = function() {
                  function StringUtilities2() {
                  }
                  StringUtilities2.format = function(template) {
                    var values = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                      values[_i - 1] = arguments[_i];
                    }
                    return template.replace(/%s/g, function(substring) {
                      var args = [];
                      for (var _i2 = 1; _i2 < arguments.length; _i2++) {
                        args[_i2 - 1] = arguments[_i2];
                      }
                      return values.shift();
                    });
                  };
                  StringUtilities2.containsAny = function(text, searchStrings) {
                    return searchStrings.some(function(c) {
                      return text.indexOf(c) > -1;
                    });
                  };
                  return StringUtilities2;
                }();
                exports2.StringUtilities = StringUtilities;
              }
            )
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          var __webpack_exports__ = {};
          (() => {
            var exports2 = __webpack_exports__;
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.toString = void 0;
            var expressionDescriptor_1 = __webpack_require__(333);
            var enLocaleLoader_1 = __webpack_require__(747);
            expressionDescriptor_1.ExpressionDescriptor.initialize(new enLocaleLoader_1.enLocaleLoader());
            exports2["default"] = expressionDescriptor_1.ExpressionDescriptor;
            var toString = expressionDescriptor_1.ExpressionDescriptor.toString;
            exports2.toString = toString;
          })();
          return __webpack_exports__;
        })()
      );
    });
  }
});

// ../../node_modules/.pnpm/zod@3.24.2/node_modules/zod/lib/index.mjs
init_esm();
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === errorMap ? void 0 : errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache;
var _ZodNativeEnum_cache;
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    var _a, _b;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a = message !== null && message !== void 0 ? message : required_error) !== null && _a !== void 0 ? _a : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    var _a, _b;
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if ((_b = (_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if (!decoded.typ || !decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch (_a) {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a, _b;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
      local: (_b = options === null || options === void 0 ? void 0 : options.local) !== null && _b !== void 0 ? _b : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch (_a) {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, void 0);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodEnum_cache, new Set(this._def.values), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
_ZodEnum_cache = /* @__PURE__ */ new WeakMap();
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, void 0);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
_ZodNativeEnum_cache = /* @__PURE__ */ new WeakMap();
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          var _a2, _b2;
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = (_b2 = (_a2 = params.fatal) !== null && _a2 !== void 0 ? _a2 : fatal) !== null && _b2 !== void 0 ? _b2 : true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = (_b = (_a = params.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
var z2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/eventTrigger.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/index.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/index.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/api.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/addMissingVersionField.js
init_esm();
function addMissingVersionField(val) {
  if (val !== null && typeof val === "object" && !("version" in val)) {
    return {
      ...val,
      version: "1"
    };
  }
  return val;
}

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/errors.js
init_esm();
var ErrorWithStackSchema = z.object({
  message: z.string(),
  name: z.string().optional(),
  stack: z.string().optional()
});
var SchemaErrorSchema = z.object({
  path: z.array(z.string()),
  message: z.string()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/eventFilter.js
init_esm();
var stringPatternMatchers = [
  z.object({
    $endsWith: z.string()
  }),
  z.object({
    $startsWith: z.string()
  }),
  z.object({
    $ignoreCaseEquals: z.string()
  })
];
var EventMatcherSchema = z.union([
  /** Match against a string */
  z.array(z.string()),
  /** Match against a number */
  z.array(z.number()),
  /** Match against a boolean */
  z.array(z.boolean()),
  z.array(z.union([
    ...stringPatternMatchers,
    z.object({
      $exists: z.boolean()
    }),
    z.object({
      $isNull: z.boolean()
    }),
    z.object({
      $anythingBut: z.union([z.string(), z.number(), z.boolean()])
    }),
    z.object({
      $anythingBut: z.union([z.array(z.string()), z.array(z.number()), z.array(z.boolean())])
    }),
    z.object({
      $gt: z.number()
    }),
    z.object({
      $lt: z.number()
    }),
    z.object({
      $gte: z.number()
    }),
    z.object({
      $lte: z.number()
    }),
    z.object({
      $between: z.tuple([z.number(), z.number()])
    }),
    z.object({
      $includes: z.union([z.string(), z.number(), z.boolean()])
    }),
    z.object({
      $not: z.union([z.string(), z.number(), z.boolean()])
    })
  ]))
]);
var EventFilterSchema = z.lazy(() => z.record(z.union([EventMatcherSchema, EventFilterSchema])));
var EventRuleSchema = z.object({
  event: z.string().or(z.array(z.string())),
  source: z.string(),
  payload: EventFilterSchema.optional(),
  context: EventFilterSchema.optional()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/integrations.js
init_esm();
var ConnectionAuthSchema = z.object({
  type: z.enum(["oauth2", "apiKey"]),
  accessToken: z.string(),
  scopes: z.array(z.string()).optional(),
  additionalFields: z.record(z.string()).optional()
});
var IntegrationMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructions: z.string().optional()
});
var IntegrationConfigSchema = z.object({
  id: z.string(),
  metadata: IntegrationMetadataSchema,
  authSource: z.enum(["HOSTED", "LOCAL", "RESOLVER"])
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/properties.js
init_esm();
var DisplayPropertySchema = z.object({
  /** The label for the property */
  label: z.string(),
  /** The value of the property */
  text: z.string(),
  /** The URL to link to when the property is clicked */
  url: z.string().optional(),
  /** The URL to a list of images to display next to the property */
  imageUrl: z.array(z.string()).optional()
});
var DisplayPropertiesSchema = z.array(DisplayPropertySchema);
var StyleSchema = z.object({
  /** The style, `normal` or `minimal` */
  style: z.enum(["normal", "minimal"]),
  /** A variant of the style. */
  variant: z.string().optional()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/schedules.js
init_esm();
var ScheduledPayloadSchema = z.object({
  ts: z.coerce.date(),
  lastTimestamp: z.coerce.date().optional()
});
var IntervalOptionsSchema = z.object({
  /** The number of seconds for the interval. Min = 20, Max = 2_592_000 (30 days) */
  seconds: z.number().int().positive().min(20).max(2592e3)
});
var CronOptionsSchema = z.object({
  /** A CRON expression that defines the schedule. A useful tool when writing CRON
    expressions is [crontab guru](https://crontab.guru). Note that the timezone
    used is UTC. */
  cron: z.string()
});
var CronMetadataSchema = z.object({
  type: z.literal("cron"),
  options: CronOptionsSchema,
  /** An optional Account ID to associate with runs triggered by this interval */
  accountId: z.string().optional(),
  metadata: z.any()
});
var IntervalMetadataSchema = z.object({
  /** An interval reoccurs at the specified number of seconds  */
  type: z.literal("interval"),
  /** An object containing options about the interval. */
  options: IntervalOptionsSchema,
  /** An optional Account ID to associate with runs triggered by this interval */
  accountId: z.string().optional(),
  /** Any additional metadata about the schedule. */
  metadata: z.any()
});
var ScheduleMetadataSchema = z.discriminatedUnion("type", [
  IntervalMetadataSchema,
  CronMetadataSchema
]);
var RegisterDynamicSchedulePayloadSchema = z.object({
  id: z.string(),
  jobs: z.array(z.object({
    id: z.string(),
    version: z.string()
  }))
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/tasks.js
init_esm();
var TaskStatusSchema = z.enum([
  "PENDING",
  "WAITING",
  "RUNNING",
  "COMPLETED",
  "ERRORED",
  "CANCELED"
]);
var TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional().nullable(),
  noop: z.boolean(),
  startedAt: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  delayUntil: z.coerce.date().optional().nullable(),
  status: TaskStatusSchema,
  description: z.string().optional().nullable(),
  properties: z.array(DisplayPropertySchema).optional().nullable(),
  outputProperties: z.array(DisplayPropertySchema).optional().nullable(),
  params: DeserializedJsonSchema.optional().nullable(),
  output: DeserializedJsonSchema.optional().nullable(),
  context: DeserializedJsonSchema.optional().nullable(),
  error: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  style: StyleSchema.optional().nullable(),
  operation: z.string().optional().nullable(),
  callbackUrl: z.string().optional().nullable(),
  childExecutionMode: z.enum(["SEQUENTIAL", "PARALLEL"]).optional().nullable()
});
var ServerTaskSchema = TaskSchema.extend({
  idempotencyKey: z.string(),
  attempts: z.number(),
  forceYield: z.boolean().optional().nullable()
});
var CachedTaskSchema = z.object({
  id: z.string(),
  idempotencyKey: z.string(),
  status: TaskStatusSchema,
  noop: z.boolean().default(false),
  output: DeserializedJsonSchema.optional().nullable(),
  parentId: z.string().optional().nullable()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/triggers.js
init_esm();
var EventExampleSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  name: z.string(),
  payload: z.any()
});
var EventSpecificationSchema = z.object({
  name: z.string().or(z.array(z.string())),
  title: z.string(),
  source: z.string(),
  icon: z.string(),
  filter: EventFilterSchema.optional(),
  properties: z.array(DisplayPropertySchema).optional(),
  schema: z.any().optional(),
  examples: z.array(EventExampleSchema).optional()
});
var DynamicTriggerMetadataSchema = z.object({
  type: z.literal("dynamic"),
  id: z.string()
});
var TriggerHelpSchema = z.object({
  noRuns: z.object({
    text: z.string(),
    link: z.string().optional()
  }).optional()
});
var StaticTriggerMetadataSchema = z.object({
  type: z.literal("static"),
  title: z.union([z.string(), z.array(z.string())]),
  properties: z.array(DisplayPropertySchema).optional(),
  rule: EventRuleSchema,
  link: z.string().optional(),
  help: TriggerHelpSchema.optional()
});
var InvokeTriggerMetadataSchema = z.object({
  type: z.literal("invoke")
});
var ScheduledTriggerMetadataSchema = z.object({
  type: z.literal("scheduled"),
  schedule: ScheduleMetadataSchema
});
var TriggerMetadataSchema = z.discriminatedUnion("type", [
  DynamicTriggerMetadataSchema,
  StaticTriggerMetadataSchema,
  ScheduledTriggerMetadataSchema,
  InvokeTriggerMetadataSchema
]);

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/runs.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/statuses.js
init_esm();
var StatusUpdateStateSchema = z.union([
  z.literal("loading"),
  z.literal("success"),
  z.literal("failure")
]);
var StatusUpdateDataSchema = z.record(SerializableJsonSchema);
var StatusUpdateSchema = z.object({
  label: z.string().optional(),
  state: StatusUpdateStateSchema.optional(),
  data: StatusUpdateDataSchema.optional()
});
var InitalStatusUpdateSchema = StatusUpdateSchema.required({ label: true });
var StatusHistorySchema = z.array(StatusUpdateSchema);
var JobRunStatusRecordSchema = InitalStatusUpdateSchema.extend({
  key: z.string(),
  history: StatusHistorySchema
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/runs.js
var RunStatusSchema = z.union([
  z.literal("PENDING"),
  z.literal("QUEUED"),
  z.literal("WAITING_ON_CONNECTIONS"),
  z.literal("PREPROCESSING"),
  z.literal("STARTED"),
  z.literal("SUCCESS"),
  z.literal("FAILURE"),
  z.literal("TIMED_OUT"),
  z.literal("ABORTED"),
  z.literal("CANCELED"),
  z.literal("UNRESOLVED_AUTH"),
  z.literal("INVALID_PAYLOAD"),
  z.literal("EXECUTING"),
  z.literal("WAITING_TO_CONTINUE"),
  z.literal("WAITING_TO_EXECUTE")
]);
var RunTaskSchema = z.object({
  /** The Task id */
  id: z.string(),
  /** The key that you defined when creating the Task, the first param in any task. */
  displayKey: z.string().nullable(),
  /** The Task status */
  status: TaskStatusSchema,
  /** The name of the Task */
  name: z.string(),
  /** The icon of the Task, a string.
   * For integrations, this will be a lowercase name of the company.
   * Can be used with the [@trigger.dev/companyicons](https://www.npmjs.com/package/@trigger.dev/companyicons) package to display an svg. */
  icon: z.string().nullable(),
  /** When the task started */
  startedAt: z.coerce.date().nullable(),
  /** When the task completed */
  completedAt: z.coerce.date().nullable()
});
var RunTaskWithSubtasksSchema = RunTaskSchema.extend({
  subtasks: z.lazy(() => RunTaskWithSubtasksSchema.array()).optional()
});
var GetRunOptionsSchema = z.object({
  /** Return subtasks, which appear in a `subtasks` array on a task. @default false */
  subtasks: z.boolean().optional(),
  /** You can use this to get more tasks, if there are more than are returned in a single batch @default undefined */
  cursor: z.string().optional(),
  /** How many tasks you want to return in one go, max 50. @default 20 */
  take: z.number().optional()
});
var GetRunOptionsWithTaskDetailsSchema = GetRunOptionsSchema.extend({
  /** If `true`, it returns the `params` and `output` of all tasks. @default false */
  taskdetails: z.boolean().optional()
});
var RunSchema = z.object({
  /** The Run id */
  id: z.string(),
  /** The Run status */
  status: RunStatusSchema,
  /** When the run started */
  startedAt: z.coerce.date().nullable(),
  /** When the run was last updated */
  updatedAt: z.coerce.date().nullable(),
  /** When the run was completed */
  completedAt: z.coerce.date().nullable()
});
var GetRunSchema = RunSchema.extend({
  /** The output of the run */
  output: z.any().optional(),
  /** The tasks from the run */
  tasks: z.array(RunTaskWithSubtasksSchema),
  /** Any status updates that were published from the run */
  statuses: z.array(JobRunStatusRecordSchema).default([]),
  /** If there are more tasks, you can use this to get them */
  nextCursor: z.string().optional()
});
var GetRunsOptionsSchema = z.object({
  /** You can use this to get more tasks, if there are more than are returned in a single batch @default undefined */
  cursor: z.string().optional(),
  /** How many runs you want to return in one go, max 50. @default 20 */
  take: z.number().optional()
});
var GetRunsSchema = z.object({
  /** The runs from the query */
  runs: RunSchema.array(),
  /** If there are more runs, you can use this to get them */
  nextCursor: z.string().optional()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/requestFilter.js
init_esm();
var StringMatchSchema = z.union([
  /** Match against a string */
  z.array(z.string()),
  z.array(z.union(stringPatternMatchers))
]);
var HTTPMethodUnionSchema = z.union([
  z.literal("GET"),
  z.literal("POST"),
  z.literal("PUT"),
  z.literal("PATCH"),
  z.literal("DELETE"),
  z.literal("HEAD"),
  z.literal("OPTIONS")
]);
var RequestFilterSchema = z.object({
  /** An array of HTTP methods to match.
   * For example, `["GET", "POST"]` will match both `GET` and `POST` Requests. */
  method: z.array(HTTPMethodUnionSchema).optional(),
  /** An object of header key/values to match.
     * This uses the [EventFilter matching syntax](https://trigger.dev/docs/documentation/guides/event-filter).
  
      @example
    ```ts
    filter: {
      header: {
        "content-type": ["application/json"],
      },
    },
    ``` */
  headers: z.record(StringMatchSchema).optional(),
  /** An object of query parameters to match.
     * This uses the [EventFilter matching syntax](https://trigger.dev/docs/documentation/guides/event-filter).
  
    @example
    ```ts
    filter: {
      query: {
        "hub.mode": [{ $startsWith: "sub" }],
      },
    },
    ``` */
  query: z.record(StringMatchSchema).optional(),
  /** An object of key/values to match.
   * This uses the [EventFilter matching syntax](https://trigger.dev/docs/documentation/guides/event-filter).
   */
  body: EventFilterSchema.optional()
});
var ResponseFilterSchema = RequestFilterSchema.omit({ method: true, query: true }).extend({
  status: z.array(z.number()).optional()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/api.js
var UpdateTriggerSourceBodyV1Schema = z.object({
  registeredEvents: z.array(z.string()),
  secret: z.string().optional(),
  data: SerializableJsonSchema.optional()
});
var UpdateTriggerSourceBodyV2Schema = z.object({
  secret: z.string().optional(),
  data: SerializableJsonSchema.optional(),
  options: z.object({
    event: z.array(z.string())
  }).and(z.record(z.string(), z.array(z.string())).optional())
});
var UpdateWebhookBodySchema = z.discriminatedUnion("active", [
  z.object({
    active: z.literal(false)
  }),
  z.object({
    active: z.literal(true),
    config: z.record(z.string().array())
  })
]);
var RegisterHTTPTriggerSourceBodySchema = z.object({
  type: z.literal("HTTP"),
  url: z.string().url()
});
var RegisterSMTPTriggerSourceBodySchema = z.object({
  type: z.literal("SMTP")
});
var RegisterSQSTriggerSourceBodySchema = z.object({
  type: z.literal("SQS")
});
var RegisterSourceChannelBodySchema = z.discriminatedUnion("type", [
  RegisterHTTPTriggerSourceBodySchema,
  RegisterSMTPTriggerSourceBodySchema,
  RegisterSQSTriggerSourceBodySchema
]);
var REGISTER_WEBHOOK = "dev.trigger.webhook.register";
var RegisterWebhookSourceSchema = z.object({
  key: z.string(),
  params: z.any(),
  config: z.any(),
  active: z.boolean(),
  secret: z.string(),
  url: z.string(),
  data: DeserializedJsonSchema.optional(),
  clientId: z.string().optional()
});
var RegisterWebhookPayloadSchema = z.object({
  active: z.boolean(),
  params: z.any().optional(),
  config: z.object({
    current: z.record(z.string().array()),
    desired: z.record(z.string().array())
  }),
  // from HTTP Endpoint
  url: z.string(),
  secret: z.string()
});
var REGISTER_SOURCE_EVENT_V2 = "dev.trigger.source.register.v2";
var RegisterTriggerSourceSchema = z.object({
  key: z.string(),
  params: z.any(),
  active: z.boolean(),
  secret: z.string(),
  data: DeserializedJsonSchema.optional(),
  channel: RegisterSourceChannelBodySchema,
  clientId: z.string().optional()
});
var SourceEventOptionSchema = z.object({
  name: z.string(),
  value: z.string()
});
var RegisterSourceEventSchemaV1 = z.object({
  /** The id of the source */
  id: z.string(),
  source: RegisterTriggerSourceSchema,
  events: z.array(z.string()),
  missingEvents: z.array(z.string()),
  orphanedEvents: z.array(z.string()),
  dynamicTriggerId: z.string().optional()
});
var RegisteredOptionsDiffSchema = z.object({
  desired: z.array(z.string()),
  missing: z.array(z.string()),
  orphaned: z.array(z.string())
});
var RegisterSourceEventOptionsSchema = z.object({
  event: RegisteredOptionsDiffSchema
}).and(z.record(z.string(), RegisteredOptionsDiffSchema));
var RegisterSourceEventSchemaV2 = z.object({
  /** The id of the source */
  id: z.string(),
  source: RegisterTriggerSourceSchema,
  options: RegisterSourceEventOptionsSchema,
  dynamicTriggerId: z.string().optional()
});
var TriggerSourceSchema = z.object({
  id: z.string(),
  key: z.string()
});
var HttpSourceResponseMetadataSchema = DeserializedJsonSchema;
var HandleTriggerSourceSchema = z.object({
  key: z.string(),
  secret: z.string(),
  data: z.any(),
  params: z.any(),
  auth: ConnectionAuthSchema.optional(),
  metadata: HttpSourceResponseMetadataSchema.optional()
});
var HttpSourceRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-dynamic-id": z.string().optional(),
  "x-ts-secret": z.string(),
  "x-ts-data": z.string().transform((s) => JSON.parse(s)),
  "x-ts-params": z.string().transform((s) => JSON.parse(s)),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s))),
  "x-ts-auth": z.string().optional().transform((s) => {
    if (s === void 0)
      return;
    const json = JSON.parse(s);
    return ConnectionAuthSchema.parse(json);
  }),
  "x-ts-metadata": z.string().optional().transform((s) => {
    if (s === void 0)
      return;
    const json = JSON.parse(s);
    return DeserializedJsonSchema.parse(json);
  })
});
var HttpEndpointRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s)))
});
var WebhookSourceRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-dynamic-id": z.string().optional(),
  "x-ts-secret": z.string(),
  "x-ts-params": z.string().transform((s) => JSON.parse(s)),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s)))
});
var PongSuccessResponseSchema = z.object({
  ok: z.literal(true),
  triggerVersion: z.string().optional(),
  triggerSdkVersion: z.string().optional()
});
var PongErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  triggerVersion: z.string().optional(),
  triggerSdkVersion: z.string().optional()
});
var PongResponseSchema = z.discriminatedUnion("ok", [
  PongSuccessResponseSchema,
  PongErrorResponseSchema
]);
var ValidateSuccessResponseSchema = z.object({
  ok: z.literal(true),
  endpointId: z.string(),
  triggerVersion: z.string().optional()
});
var ValidateErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  triggerVersion: z.string().optional()
});
var ValidateResponseSchema = z.discriminatedUnion("ok", [
  ValidateSuccessResponseSchema,
  ValidateErrorResponseSchema
]);
var QueueOptionsSchema = z.object({
  name: z.string(),
  maxConcurrent: z.number().optional()
});
var ConcurrencyLimitOptionsSchema = z.object({
  id: z.string(),
  limit: z.number()
});
var JobMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  event: EventSpecificationSchema,
  trigger: TriggerMetadataSchema,
  integrations: z.record(IntegrationConfigSchema),
  internal: z.boolean().default(false),
  enabled: z.boolean(),
  startPosition: z.enum(["initial", "latest"]),
  preprocessRuns: z.boolean(),
  concurrencyLimit: ConcurrencyLimitOptionsSchema.or(z.number().int().positive()).optional()
});
var SourceMetadataV1Schema = z.object({
  version: z.literal("1"),
  channel: z.enum(["HTTP", "SQS", "SMTP"]),
  integration: IntegrationConfigSchema,
  key: z.string(),
  params: z.any(),
  events: z.array(z.string()),
  registerSourceJob: z.object({
    id: z.string(),
    version: z.string()
  }).optional()
});
var SourceMetadataV2Schema = z.object({
  version: z.literal("2"),
  channel: z.enum(["HTTP", "SQS", "SMTP"]),
  integration: IntegrationConfigSchema,
  key: z.string(),
  params: z.any(),
  options: z.record(z.array(z.string())),
  registerSourceJob: z.object({
    id: z.string(),
    version: z.string()
  }).optional()
});
var SourceMetadataSchema = z.preprocess(addMissingVersionField, z.discriminatedUnion("version", [SourceMetadataV1Schema, SourceMetadataV2Schema]));
var WebhookMetadataSchema = z.object({
  key: z.string(),
  params: z.any(),
  config: z.record(z.array(z.string())),
  integration: IntegrationConfigSchema,
  httpEndpoint: z.object({
    id: z.string()
  })
});
var WebhookContextMetadataSchema = z.object({
  params: z.any(),
  config: z.record(z.string().array()),
  secret: z.string()
});
var DynamicTriggerEndpointMetadataSchema = z.object({
  id: z.string(),
  jobs: z.array(JobMetadataSchema.pick({ id: true, version: true })),
  registerSourceJob: z.object({
    id: z.string(),
    version: z.string()
  }).optional()
});
var HttpEndpointMetadataSchema = z.object({
  id: z.string(),
  version: z.string(),
  enabled: z.boolean(),
  title: z.string().optional(),
  icon: z.string().optional(),
  properties: z.array(DisplayPropertySchema).optional(),
  event: EventSpecificationSchema,
  immediateResponseFilter: RequestFilterSchema.optional(),
  skipTriggeringRuns: z.boolean().optional(),
  source: z.string()
});
var IndexEndpointResponseSchema = z.object({
  jobs: z.array(JobMetadataSchema),
  sources: z.array(SourceMetadataSchema),
  webhooks: z.array(WebhookMetadataSchema).optional(),
  dynamicTriggers: z.array(DynamicTriggerEndpointMetadataSchema),
  dynamicSchedules: z.array(RegisterDynamicSchedulePayloadSchema),
  httpEndpoints: z.array(HttpEndpointMetadataSchema).optional()
});
var EndpointIndexErrorSchema = z.object({
  message: z.string(),
  raw: z.any().optional()
});
var IndexEndpointStatsSchema = z.object({
  jobs: z.number(),
  sources: z.number(),
  webhooks: z.number().optional(),
  dynamicTriggers: z.number(),
  dynamicSchedules: z.number(),
  disabledJobs: z.number().default(0),
  httpEndpoints: z.number().default(0)
});
var GetEndpointIndexResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("PENDING"),
    updatedAt: z.coerce.date()
  }),
  z.object({
    status: z.literal("STARTED"),
    updatedAt: z.coerce.date()
  }),
  z.object({
    status: z.literal("SUCCESS"),
    stats: IndexEndpointStatsSchema,
    updatedAt: z.coerce.date()
  }),
  z.object({
    status: z.literal("FAILURE"),
    error: EndpointIndexErrorSchema,
    updatedAt: z.coerce.date()
  })
]);
var EndpointHeadersSchema = z.object({
  "trigger-version": z.string().optional(),
  "trigger-sdk-version": z.string().optional()
});
var ExecuteJobRunMetadataSchema = z.object({
  successSubscription: z.boolean().optional(),
  failedSubscription: z.boolean().optional()
});
var ExecuteJobHeadersSchema = EndpointHeadersSchema.extend({
  "x-trigger-run-metadata": z.preprocess((val) => typeof val === "string" && JSON.parse(val), ExecuteJobRunMetadataSchema).optional()
});
var RawEventSchema = z.object({
  /** The `name` property must exactly match any subscriptions you want to
      trigger. */
  name: z.string(),
  /** The `payload` property will be sent to any matching Jobs and will appear
      as the `payload` param of the `run()` function. You can leave this
      parameter out if you just want to trigger a Job without any input data. */
  payload: z.any(),
  /** The optional `context` property will be sent to any matching Jobs and will
      be passed through as the `context.event.context` param of the `run()`
      function. This is optional but can be useful if you want to pass through
      some additional context to the Job. */
  context: z.any().optional(),
  /** The `id` property uniquely identify this particular event. If unset it
      will be set automatically using `ulid`. */
  id: z.string().default(() => globalThis.crypto.randomUUID()),
  /** This is optional, it defaults to the current timestamp. Usually you would
      only set this if you have a timestamp that you wish to pass through, e.g.
      you receive a timestamp from a service and you want the same timestamp to
      be used in your Job. */
  timestamp: z.coerce.date().optional(),
  /** This is optional, it defaults to "trigger.dev". It can be useful to set
      this as you can filter events using this in the `eventTrigger()`. */
  source: z.string().optional(),
  /** This is optional, it defaults to "JSON". If your event is actually a request,
      with a url, headers, method and rawBody you can use "REQUEST" */
  payloadType: z.union([z.literal("JSON"), z.literal("REQUEST")]).optional()
});
var ApiEventLogSchema = z.object({
  /** The `id` of the event that was sent.
   */
  id: z.string(),
  /** The `name` of the event that was sent. */
  name: z.string(),
  /** The `payload` of the event that was sent */
  payload: DeserializedJsonSchema,
  /** The `context` of the event that was sent. Is `undefined` if no context was
      set when sending the event. */
  context: DeserializedJsonSchema.optional().nullable(),
  /** The `timestamp` of the event that was sent */
  timestamp: z.coerce.date(),
  /** The timestamp when the event will be delivered to any matching Jobs. Is
      `undefined` if `deliverAt` or `deliverAfter` wasn't set when sending the
      event. */
  deliverAt: z.coerce.date().optional().nullable(),
  /** The timestamp when the event was delivered. Is `undefined` if `deliverAt`
      or `deliverAfter` were set when sending the event. */
  deliveredAt: z.coerce.date().optional().nullable(),
  /** The timestamp when the event was cancelled. Is `undefined` if the event
   * wasn't cancelled. */
  cancelledAt: z.coerce.date().optional().nullable()
});
var SendEventOptionsSchema = z.object({
  /** An optional Date when you want the event to trigger Jobs. The event will
      be sent to the platform immediately but won't be acted upon until the
      specified time. */
  deliverAt: z.coerce.date().optional(),
  /** An optional number of seconds you want to wait for the event to trigger
      any relevant Jobs. The event will be sent to the platform immediately but
      won't be delivered until after the elapsed number of seconds. */
  deliverAfter: z.number().int().optional(),
  /** This optional param will be used by Trigger.dev Connect, which
      is coming soon. */
  accountId: z.string().optional()
});
var SendEventBodySchema = z.object({
  event: RawEventSchema,
  options: SendEventOptionsSchema.optional()
});
var SendBulkEventsBodySchema = z.object({
  events: RawEventSchema.array(),
  options: SendEventOptionsSchema.optional()
});
var DeliverEventResponseSchema = z.object({
  deliveredAt: z.string().datetime()
});
var RuntimeEnvironmentTypeSchema = z.enum([
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "PREVIEW"
]);
var RunSourceContextSchema = z.object({
  id: z.string(),
  metadata: z.any()
});
var AutoYieldConfigSchema = z.object({
  startTaskThreshold: z.number(),
  beforeExecuteTaskThreshold: z.number(),
  beforeCompleteTaskThreshold: z.number(),
  afterCompleteTaskThreshold: z.number()
});
var RunJobBodySchema = z.object({
  event: ApiEventLogSchema,
  job: z.object({
    id: z.string(),
    version: z.string()
  }),
  run: z.object({
    id: z.string(),
    isTest: z.boolean(),
    isRetry: z.boolean().default(false),
    startedAt: z.coerce.date()
  }),
  environment: z.object({
    id: z.string(),
    slug: z.string(),
    type: RuntimeEnvironmentTypeSchema
  }),
  organization: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string()
  }),
  project: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  }).optional(),
  account: z.object({
    id: z.string(),
    metadata: z.any()
  }).optional(),
  source: RunSourceContextSchema.optional(),
  tasks: z.array(CachedTaskSchema).optional(),
  cachedTaskCursor: z.string().optional(),
  noopTasksSet: z.string().optional(),
  connections: z.record(ConnectionAuthSchema).optional(),
  yieldedExecutions: z.string().array().optional(),
  runChunkExecutionLimit: z.number().optional(),
  autoYieldConfig: AutoYieldConfigSchema.optional()
});
var RunJobErrorSchema = z.object({
  status: z.literal("ERROR"),
  error: ErrorWithStackSchema,
  task: TaskSchema.optional()
});
var RunJobYieldExecutionErrorSchema = z.object({
  status: z.literal("YIELD_EXECUTION"),
  key: z.string()
});
var AutoYieldMetadataSchema = z.object({
  location: z.string(),
  timeRemaining: z.number(),
  timeElapsed: z.number(),
  limit: z.number().optional()
});
var RunJobAutoYieldExecutionErrorSchema = AutoYieldMetadataSchema.extend({
  status: z.literal("AUTO_YIELD_EXECUTION")
});
var RunJobAutoYieldWithCompletedTaskExecutionErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_EXECUTION_WITH_COMPLETED_TASK"),
  id: z.string(),
  properties: z.array(DisplayPropertySchema).optional(),
  output: z.string().optional(),
  data: AutoYieldMetadataSchema
});
var RunJobAutoYieldRateLimitErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_RATE_LIMIT"),
  reset: z.coerce.number()
});
var RunJobInvalidPayloadErrorSchema = z.object({
  status: z.literal("INVALID_PAYLOAD"),
  errors: z.array(SchemaErrorSchema)
});
var RunJobUnresolvedAuthErrorSchema = z.object({
  status: z.literal("UNRESOLVED_AUTH_ERROR"),
  issues: z.record(z.object({ id: z.string(), error: z.string() }))
});
var RunJobResumeWithTaskSchema = z.object({
  status: z.literal("RESUME_WITH_TASK"),
  task: TaskSchema
});
var RunJobRetryWithTaskSchema = z.object({
  status: z.literal("RETRY_WITH_TASK"),
  task: TaskSchema,
  error: ErrorWithStackSchema,
  retryAt: z.coerce.date()
});
var RunJobCanceledWithTaskSchema = z.object({
  status: z.literal("CANCELED"),
  task: TaskSchema
});
var RunJobSuccessSchema = z.object({
  status: z.literal("SUCCESS"),
  output: DeserializedJsonSchema.optional()
});
var RunJobErrorResponseSchema = z.union([
  RunJobAutoYieldExecutionErrorSchema,
  RunJobAutoYieldWithCompletedTaskExecutionErrorSchema,
  RunJobYieldExecutionErrorSchema,
  RunJobAutoYieldRateLimitErrorSchema,
  RunJobErrorSchema,
  RunJobUnresolvedAuthErrorSchema,
  RunJobInvalidPayloadErrorSchema,
  RunJobResumeWithTaskSchema,
  RunJobRetryWithTaskSchema,
  RunJobCanceledWithTaskSchema
]);
var RunJobResumeWithParallelTaskSchema = z.object({
  status: z.literal("RESUME_WITH_PARALLEL_TASK"),
  task: TaskSchema,
  childErrors: z.array(RunJobErrorResponseSchema)
});
var RunJobResponseSchema = z.discriminatedUnion("status", [
  RunJobAutoYieldExecutionErrorSchema,
  RunJobAutoYieldWithCompletedTaskExecutionErrorSchema,
  RunJobYieldExecutionErrorSchema,
  RunJobAutoYieldRateLimitErrorSchema,
  RunJobErrorSchema,
  RunJobUnresolvedAuthErrorSchema,
  RunJobInvalidPayloadErrorSchema,
  RunJobResumeWithTaskSchema,
  RunJobResumeWithParallelTaskSchema,
  RunJobRetryWithTaskSchema,
  RunJobCanceledWithTaskSchema,
  RunJobSuccessSchema
]);
var PreprocessRunBodySchema = z.object({
  event: ApiEventLogSchema,
  job: z.object({
    id: z.string(),
    version: z.string()
  }),
  run: z.object({
    id: z.string(),
    isTest: z.boolean()
  }),
  environment: z.object({
    id: z.string(),
    slug: z.string(),
    type: RuntimeEnvironmentTypeSchema
  }),
  organization: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string()
  }),
  account: z.object({
    id: z.string(),
    metadata: z.any()
  }).optional()
});
var PreprocessRunResponseSchema = z.object({
  abort: z.boolean(),
  properties: z.array(DisplayPropertySchema).optional()
});
var CreateRunResponseOkSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    id: z.string()
  })
});
var CreateRunResponseErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string()
});
var CreateRunResponseBodySchema = z.discriminatedUnion("ok", [
  CreateRunResponseOkSchema,
  CreateRunResponseErrorSchema
]);
var RedactStringSchema = z.object({
  __redactedString: z.literal(true),
  strings: z.array(z.string()),
  interpolations: z.array(z.string())
});
var LogMessageSchema = z.object({
  level: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]),
  message: z.string(),
  data: SerializableJsonSchema.optional()
});
var RedactSchema = z.object({
  paths: z.array(z.string())
});
var RetryOptionsSchema = z.object({
  /** The maximum number of times to retry the request. */
  limit: z.number().optional(),
  /** The exponential factor to use when calculating the next retry time. */
  factor: z.number().optional(),
  /** The minimum amount of time to wait before retrying the request. */
  minTimeoutInMs: z.number().optional(),
  /** The maximum amount of time to wait before retrying the request. */
  maxTimeoutInMs: z.number().optional(),
  /** Whether to randomize the retry time. */
  randomize: z.boolean().optional()
});
var RunTaskOptionsSchema = z.object({
  /** The name of the Task is required. This is displayed on the Task in the logs. */
  name: z.string().optional(),
  /** The Task will wait and only start at the specified Date  */
  delayUntil: z.coerce.date().optional(),
  /** Retry options */
  retry: RetryOptionsSchema.optional(),
  /** The icon for the Task, it will appear in the logs.
   *  You can use the name of a company in lowercase, e.g. "github".
   *  Or any icon name that [Tabler Icons](https://tabler-icons.io/) supports. */
  icon: z.string().optional(),
  /** The key for the Task that you want to appear in the logs */
  displayKey: z.string().optional(),
  /** A description of the Task */
  description: z.string().optional(),
  /** Properties that are displayed in the logs */
  properties: z.array(DisplayPropertySchema).optional(),
  /** The input params to the Task, will be displayed in the logs  */
  params: z.any(),
  /** The style of the log entry. */
  style: StyleSchema.optional(),
  /** Allows you to expose a `task.callbackUrl` to use in your tasks. Enabling this feature will cause the task to return the data sent to the callbackUrl instead of the usual async callback result. */
  callback: z.object({
    /** Causes the task to wait for and return the data of the first request sent to `task.callbackUrl`. */
    enabled: z.boolean(),
    /** Time to wait for the first request to `task.callbackUrl`. Default: One hour. */
    timeoutInSeconds: z.number()
  }).partial().optional(),
  /** Allows you to link the Integration connection in the logs. This is handled automatically in integrations.  */
  connectionKey: z.string().optional(),
  /** An operation you want to perform on the Trigger.dev platform, current only "fetch", "fetch-response", and "fetch-poll" is supported. If you wish to `fetch` use [`io.backgroundFetch()`](https://trigger.dev/docs/sdk/io/backgroundfetch) instead. */
  operation: z.enum(["fetch", "fetch-response", "fetch-poll"]).optional(),
  /** A No Operation means that the code won't be executed. This is used internally to implement features like [io.wait()](https://trigger.dev/docs/sdk/io/wait).  */
  noop: z.boolean().default(false),
  redact: RedactSchema.optional(),
  parallel: z.boolean().optional()
});
var RunTaskBodyInputSchema = RunTaskOptionsSchema.extend({
  idempotencyKey: z.string(),
  parentId: z.string().optional()
});
var RunTaskBodyOutputSchema = RunTaskBodyInputSchema.extend({
  properties: z.array(DisplayPropertySchema.partial()).optional(),
  params: DeserializedJsonSchema.optional().nullable(),
  callback: z.object({
    enabled: z.boolean(),
    timeoutInSeconds: z.number().default(3600)
  }).optional()
});
var RunTaskResponseWithCachedTasksBodySchema = z.object({
  task: ServerTaskSchema,
  cachedTasks: z.object({
    tasks: z.array(CachedTaskSchema),
    cursor: z.string().optional()
  }).optional()
});
var CompleteTaskBodyInputSchema = RunTaskBodyInputSchema.pick({
  properties: true,
  description: true,
  params: true
}).extend({
  output: SerializableJsonSchema.optional().transform((v) => v ? DeserializedJsonSchema.parse(JSON.parse(JSON.stringify(v))) : {})
});
var CompleteTaskBodyV2InputSchema = RunTaskBodyInputSchema.pick({
  properties: true,
  description: true,
  params: true
}).extend({
  output: z.string().optional()
});
var FailTaskBodyInputSchema = z.object({
  error: ErrorWithStackSchema
});
var NormalizedRequestSchema = z.object({
  headers: z.record(z.string()),
  method: z.string(),
  query: z.record(z.string()),
  url: z.string(),
  body: z.any()
});
var NormalizedResponseSchema = z.object({
  status: z.number(),
  body: z.any(),
  headers: z.record(z.string()).optional()
});
var HttpSourceResponseSchema = z.object({
  response: NormalizedResponseSchema,
  events: z.array(RawEventSchema),
  metadata: HttpSourceResponseMetadataSchema.optional()
});
var WebhookDeliveryResponseSchema = z.object({
  response: NormalizedResponseSchema,
  verified: z.boolean(),
  error: z.string().optional()
});
var RegisterTriggerBodySchemaV1 = z.object({
  rule: EventRuleSchema,
  source: SourceMetadataV1Schema
});
var RegisterTriggerBodySchemaV2 = z.object({
  rule: EventRuleSchema,
  source: SourceMetadataV2Schema,
  accountId: z.string().optional()
});
var InitializeTriggerBodySchema = z.object({
  id: z.string(),
  params: z.any(),
  accountId: z.string().optional(),
  metadata: z.any().optional()
});
var RegisterCommonScheduleBodySchema = z.object({
  /** A unique id for the schedule. This is used to identify and unregister the schedule later. */
  id: z.string(),
  /** Any additional metadata about the schedule. */
  metadata: z.any(),
  /** An optional Account ID to associate with runs triggered by this schedule */
  accountId: z.string().optional()
});
var RegisterIntervalScheduleBodySchema = RegisterCommonScheduleBodySchema.merge(IntervalMetadataSchema);
var InitializeCronScheduleBodySchema = RegisterCommonScheduleBodySchema.merge(CronMetadataSchema);
var RegisterScheduleBodySchema = z.discriminatedUnion("type", [
  RegisterIntervalScheduleBodySchema,
  InitializeCronScheduleBodySchema
]);
var RegisterScheduleResponseBodySchema = z.object({
  id: z.string(),
  schedule: ScheduleMetadataSchema,
  metadata: z.any(),
  active: z.boolean()
});
var CreateExternalConnectionBodySchema = z.object({
  accessToken: z.string(),
  type: z.enum(["oauth2"]),
  scopes: z.array(z.string()).optional(),
  metadata: z.any()
});
var GetRunStatusesSchema = z.object({
  run: z.object({ id: z.string(), status: RunStatusSchema, output: z.any().optional() }),
  statuses: z.array(JobRunStatusRecordSchema)
});
var InvokeJobResponseSchema = z.object({
  id: z.string()
});
var InvokeJobRequestBodySchema = z.object({
  payload: z.any(),
  context: z.any().optional(),
  options: z.object({
    accountId: z.string().optional(),
    callbackUrl: z.string().optional()
  }).optional()
});
var InvokeOptionsSchema = z.object({
  accountId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  context: z.any().optional(),
  callbackUrl: z.string().optional()
});
var EphemeralEventDispatcherRequestBodySchema = z.object({
  url: z.string(),
  name: z.string().or(z.array(z.string())),
  source: z.string().optional(),
  filter: EventFilterSchema.optional(),
  contextFilter: EventFilterSchema.optional(),
  accountId: z.string().optional(),
  timeoutInSeconds: z.number().int().positive().min(10).max(60 * 60 * 24 * 365).default(3600)
});
var EphemeralEventDispatcherResponseBodySchema = z.object({
  id: z.string()
});
var KeyValueStoreResponseBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("DELETE"),
    key: z.string(),
    deleted: z.boolean()
  }),
  z.object({
    action: z.literal("GET"),
    key: z.string(),
    value: z.string().optional()
  }),
  z.object({
    action: z.literal("HAS"),
    key: z.string(),
    has: z.boolean()
  }),
  z.object({
    action: z.literal("SET"),
    key: z.string(),
    value: z.string().optional()
  })
]);

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/notifications.js
init_esm();
var CommonMissingConnectionNotificationPayloadSchema = z.object({
  id: z.string(),
  client: z.object({
    id: z.string(),
    title: z.string(),
    scopes: z.array(z.string()),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
  }),
  authorizationUrl: z.string()
});
var MissingDeveloperConnectionNotificationPayloadSchema = CommonMissingConnectionNotificationPayloadSchema.extend({
  type: z.literal("DEVELOPER")
});
var MissingExternalConnectionNotificationPayloadSchema = CommonMissingConnectionNotificationPayloadSchema.extend({
  type: z.literal("EXTERNAL"),
  account: z.object({
    id: z.string(),
    metadata: z.any()
  })
});
var MissingConnectionNotificationPayloadSchema = z.discriminatedUnion("type", [
  MissingDeveloperConnectionNotificationPayloadSchema,
  MissingExternalConnectionNotificationPayloadSchema
]);
var CommonMissingConnectionNotificationResolvedPayloadSchema = z.object({
  id: z.string(),
  client: z.object({
    id: z.string(),
    title: z.string(),
    scopes: z.array(z.string()),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    integrationIdentifier: z.string(),
    integrationAuthMethod: z.string()
  }),
  expiresAt: z.coerce.date()
});
var MissingDeveloperConnectionResolvedNotificationPayloadSchema = CommonMissingConnectionNotificationResolvedPayloadSchema.extend({
  type: z.literal("DEVELOPER")
});
var MissingExternalConnectionResolvedNotificationPayloadSchema = CommonMissingConnectionNotificationResolvedPayloadSchema.extend({
  type: z.literal("EXTERNAL"),
  account: z.object({
    id: z.string(),
    metadata: z.any()
  })
});
var MissingConnectionResolvedNotificationPayloadSchema = z.discriminatedUnion("type", [
  MissingDeveloperConnectionResolvedNotificationPayloadSchema,
  MissingExternalConnectionResolvedNotificationPayloadSchema
]);

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/fetch.js
init_esm();
var FetchRetryHeadersStrategySchema = z.object({
  /** The `headers` strategy retries the request using info from the response headers. */
  strategy: z.literal("headers"),
  /** The header to use to determine the maximum number of times to retry the request. */
  limitHeader: z.string(),
  /** The header to use to determine the number of remaining retries. */
  remainingHeader: z.string(),
  /** The header to use to determine the time when the number of remaining retries will be reset. */
  resetHeader: z.string(),
  /** The event filter to use to determine if the request should be retried. */
  bodyFilter: EventFilterSchema.optional(),
  /** The format of the `resetHeader` value. */
  resetFormat: z.enum([
    "unix_timestamp",
    "unix_timestamp_in_ms",
    "iso_8601",
    "iso_8601_duration_openai_variant"
  ]).default("unix_timestamp")
});
var FetchRetryBackoffStrategySchema = RetryOptionsSchema.extend({
  /** The `backoff` strategy retries the request with an exponential backoff. */
  strategy: z.literal("backoff"),
  /** The event filter to use to determine if the request should be retried. */
  bodyFilter: EventFilterSchema.optional()
});
var FetchRetryStrategySchema = z.discriminatedUnion("strategy", [
  FetchRetryHeadersStrategySchema,
  FetchRetryBackoffStrategySchema
]);
var FetchRequestInitSchema = z.object({
  /** The HTTP method to use for the request. */
  method: z.string().optional(),
  /** Any headers to send with the request. Note that you can use [redactString](https://trigger.dev/docs/sdk/redactString) to prevent sensitive information from being stored (e.g. in the logs), like API keys and tokens. */
  headers: z.record(z.union([z.string(), RedactStringSchema])).optional(),
  /** The body of the request. */
  body: z.union([z.string(), z.instanceof(ArrayBuffer)]).optional()
});
var FetchRetryOptionsSchema = z.record(FetchRetryStrategySchema);
var FetchTimeoutOptionsSchema = z.object({
  durationInMs: z.number(),
  retry: RetryOptionsSchema.optional()
});
var FetchOperationSchema = z.object({
  url: z.string(),
  requestInit: FetchRequestInitSchema.optional(),
  retry: z.record(FetchRetryStrategySchema).optional(),
  timeout: FetchTimeoutOptionsSchema.optional()
});
var FetchPollOperationSchema = z.object({
  url: z.string(),
  interval: z.number().int().positive().min(10).max(600).default(10),
  // defaults to 10 seconds
  timeout: z.number().int().positive().min(30).max(3600).default(600),
  // defaults to 10 minutes
  responseFilter: ResponseFilterSchema,
  requestInit: FetchRequestInitSchema.optional(),
  requestTimeout: FetchTimeoutOptionsSchema.optional()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/events.js
init_esm();
var GetEventSchema = z.object({
  /** The event id */
  id: z.string(),
  /** The event name */
  name: z.string(),
  /** When the event was created */
  createdAt: z.coerce.date(),
  /** When the event was last updated */
  updatedAt: z.coerce.date(),
  /** The runs that were triggered by the event */
  runs: z.array(z.object({
    /** The Run id */
    id: z.string(),
    /** The Run status */
    status: RunStatusSchema,
    /** When the run started */
    startedAt: z.coerce.date().optional().nullable(),
    /** When the run completed */
    completedAt: z.coerce.date().optional().nullable()
  }))
});
var CancelRunsForEventSchema = z.object({
  cancelledRunIds: z.array(z.string()),
  failedToCancelRunIds: z.array(z.string())
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/request.js
init_esm();
var RequestWithRawBodySchema = z.object({
  url: z.string(),
  method: z.string(),
  headers: z.record(z.string()),
  rawBody: z.string()
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/schemas/jobs.js
init_esm();
var CancelRunsForJobSchema = z.object({
  cancelledRunIds: z.array(z.string()),
  failedToCancelRunIds: z.array(z.string())
});

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/types.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/replacements.js
init_esm();
var currentDate = {
  marker: "__CURRENT_DATE__",
  replace({ data: { now } }) {
    return now.toISOString();
  }
};

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/searchParams.js
init_esm();
function urlWithSearchParams(url, params) {
  if (!params) {
    return url;
  }
  const urlObj = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0) {
      urlObj.searchParams.append(key, String(value));
    }
  }
  return urlObj.toString();
}

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/requestFilterMatches.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/versions.js
init_esm();
var API_VERSIONS = {
  LAZY_LOADED_CACHED_TASKS: "2023-09-29",
  SERIALIZED_TASK_OUTPUT: "2023-11-01"
};
var PLATFORM_FEATURES = {
  yieldExecution: API_VERSIONS.LAZY_LOADED_CACHED_TASKS,
  lazyLoadedCachedTasks: API_VERSIONS.LAZY_LOADED_CACHED_TASKS
};
function supportsFeature(featureName, version) {
  if (version === "unversioned" || version === "unknown") {
    return false;
  }
  const supportedVersion = PLATFORM_FEATURES[featureName];
  if (!supportedVersion) {
    return false;
  }
  return version >= supportedVersion;
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/utils/formatSchemaErrors.js
init_esm();
function formatSchemaErrors(errors) {
  return errors.map((error) => {
    const { path, message } = error;
    return { path: path.map(String), message };
  });
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/errors.js
init_esm();
var ResumeWithTaskError = class {
  task;
  constructor(task) {
    this.task = task;
  }
};
var ResumeWithParallelTaskError = class {
  task;
  childErrors;
  constructor(task, childErrors) {
    this.task = task;
    this.childErrors = childErrors;
  }
};
var RetryWithTaskError = class {
  cause;
  task;
  retryAt;
  constructor(cause, task, retryAt) {
    this.cause = cause;
    this.task = task;
    this.retryAt = retryAt;
  }
};
var CanceledWithTaskError = class {
  task;
  constructor(task) {
    this.task = task;
  }
};
var YieldExecutionError = class {
  key;
  constructor(key) {
    this.key = key;
  }
};
var AutoYieldExecutionError = class {
  location;
  timeRemaining;
  timeElapsed;
  constructor(location, timeRemaining, timeElapsed) {
    this.location = location;
    this.timeRemaining = timeRemaining;
    this.timeElapsed = timeElapsed;
  }
};
var AutoYieldWithCompletedTaskExecutionError = class {
  id;
  properties;
  data;
  output;
  constructor(id, properties, data, output) {
    this.id = id;
    this.properties = properties;
    this.data = data;
    this.output = output;
  }
};
var AutoYieldRateLimitError = class {
  resetAtTimestamp;
  constructor(resetAtTimestamp) {
    this.resetAtTimestamp = resetAtTimestamp;
  }
};
var ParsedPayloadSchemaError = class {
  schemaErrors;
  constructor(schemaErrors) {
    this.schemaErrors = schemaErrors;
  }
};
function isTriggerError(err) {
  return err instanceof ResumeWithTaskError || err instanceof RetryWithTaskError || err instanceof CanceledWithTaskError || err instanceof YieldExecutionError || err instanceof AutoYieldExecutionError || err instanceof AutoYieldWithCompletedTaskExecutionError || err instanceof AutoYieldRateLimitError || err instanceof ResumeWithParallelTaskError;
}
var ErrorWithTask = class extends Error {
  cause;
  constructor(cause, message) {
    super(message);
    this.cause = cause;
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/eventTrigger.js
var EventTrigger = class {
  #options;
  constructor(options) {
    this.#options = options;
  }
  toJSON() {
    return {
      type: "static",
      title: this.#options.name ?? this.#options.event.title,
      rule: {
        event: this.#options.name ?? this.#options.event.name,
        source: this.#options.source ?? "trigger.dev",
        payload: deepMergeFilters(this.#options.filter ?? {}, this.#options.event.filter ?? {})
      }
    };
  }
  get event() {
    return this.#options.event;
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    if (this.#options.verify) {
      if (payload instanceof Request) {
        const clonedRequest = payload.clone();
        return this.#options.verify(clonedRequest);
      }
    }
    return { success: true };
  }
};
function eventTrigger(options) {
  return new EventTrigger({
    name: options.name,
    filter: options.filter,
    source: options.source,
    event: {
      name: options.name,
      title: "Event",
      source: options.source ?? "trigger.dev",
      icon: "custom-event",
      examples: options.examples,
      parsePayload: (rawPayload) => {
        if (options.schema) {
          const results = options.schema.safeParse(rawPayload);
          if (!results.success) {
            throw new ParsedPayloadSchemaError(formatSchemaErrors(results.error.issues));
          }
          return results.data;
        }
        return rawPayload;
      }
    }
  });
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/scheduled.js
init_esm();
var import_cronstrue = __toESM(require_cronstrue(), 1);

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/runLocalStorage.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/utils/typedAsyncLocalStorage.js
init_esm();
import { AsyncLocalStorage } from "node:async_hooks";
var TypedAsyncLocalStorage = class {
  storage;
  constructor() {
    this.storage = new AsyncLocalStorage();
  }
  runWith(context2, fn) {
    return this.storage.run(context2, fn);
  }
  getStore() {
    return this.storage.getStore();
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/runLocalStorage.js
var runLocalStorage = new TypedAsyncLocalStorage();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/scheduled.js
var examples = [
  {
    id: "now",
    name: "Now",
    icon: "clock",
    payload: {
      ts: currentDate.marker,
      lastTimestamp: currentDate.marker
    }
  }
];
var CronTrigger = class {
  options;
  constructor(options) {
    this.options = options;
  }
  get event() {
    const humanReadable = import_cronstrue.default.toString(this.options.cron, {
      throwExceptionOnParseError: false
    }).concat(" (UTC)");
    return {
      name: "trigger.scheduled",
      title: "Cron Schedule",
      source: "trigger.dev",
      icon: "schedule-cron",
      examples,
      parsePayload: ScheduledPayloadSchema.parse,
      properties: [
        {
          label: "cron",
          text: this.options.cron
        },
        {
          label: "Schedule",
          text: humanReadable
        }
      ]
    };
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return { success: true };
  }
  toJSON() {
    return {
      type: "scheduled",
      schedule: {
        type: "cron",
        options: {
          cron: this.options.cron
        }
      }
    };
  }
};
function cronTrigger(options) {
  return new CronTrigger(options);
}
var DynamicSchedule = class {
  client;
  options;
  /**
   * @param client The `TriggerClient` instance to use for registering the trigger.
   * @param options The options for the schedule.
   */
  constructor(client2, options) {
    this.client = client2;
    this.options = options;
    client2.attachDynamicSchedule(this.options.id);
  }
  get id() {
    return this.options.id;
  }
  get event() {
    return {
      name: "trigger.scheduled",
      title: "Dynamic Schedule",
      source: "trigger.dev",
      icon: "schedule-dynamic",
      examples,
      parsePayload: ScheduledPayloadSchema.parse
    };
  }
  async register(key, metadata) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return this.client.registerSchedule(this.id, key, metadata);
    }
    const { io } = runStore;
    return await io.runTask([key, "register"], async (task) => {
      return this.client.registerSchedule(this.id, key, metadata);
    }, {
      name: "Register Schedule",
      icon: metadata.type === "cron" ? "schedule-cron" : "schedule-interval",
      properties: [
        { label: "Dynamic Schedule", text: this.id },
        { label: "Schedule ID", text: key }
      ],
      params: metadata
    });
  }
  async unregister(key) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return this.client.unregisterSchedule(this.id, key);
    }
    const { io } = runStore;
    return await io.runTask([key, "unregister"], async (task) => {
      return this.client.unregisterSchedule(this.id, key);
    }, {
      name: "Unregister Schedule",
      icon: "schedule",
      properties: [
        { label: "Dynamic Schedule", text: this.id },
        { label: "Schedule ID", text: key }
      ]
    });
  }
  attachToJob(triggerClient, job) {
    triggerClient.attachDynamicScheduleToJob(this.options.id, job);
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    return { success: true };
  }
  toJSON() {
    return {
      type: "dynamic",
      id: this.options.id
    };
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/index.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/job.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/utils.js
init_esm();
function slugifyId(input) {
  const replaceSpacesWithDash = input.toLowerCase().replace(/\s+/g, "-");
  const removeNonUrlSafeChars = replaceSpacesWithDash.replace(/[^a-zA-Z0-9-._~]/g, "");
  return removeNonUrlSafeChars;
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/job.js
var Job = class {
  options;
  client;
  constructor(options) {
    this.options = options;
    this.#validate();
  }
  /**
   * Attaches the job to a client. This is called automatically when you define a job using `client.defineJob()`.
   */
  attachToClient(client2) {
    client2.attach(this);
    return this;
  }
  get id() {
    return slugifyId(this.options.id);
  }
  get enabled() {
    return typeof this.options.enabled === "boolean" ? this.options.enabled : true;
  }
  get name() {
    return this.options.name;
  }
  get trigger() {
    return this.options.trigger;
  }
  get version() {
    return this.options.version;
  }
  get logLevel() {
    return this.options.logLevel;
  }
  get integrations() {
    return Object.keys(this.options.integrations ?? {}).reduce((acc, key) => {
      const integration = this.options.integrations[key];
      if (!integration) {
        return acc;
      }
      acc[key] = {
        id: integration.id,
        metadata: integration.metadata,
        authSource: integration.authSource
      };
      return acc;
    }, {});
  }
  toJSON() {
    const internal = this.options.__internal;
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      event: this.trigger.event,
      trigger: this.trigger.toJSON(),
      integrations: this.integrations,
      startPosition: "latest",
      // this is deprecated, leaving this for now to make sure newer clients work with older servers
      enabled: this.enabled,
      preprocessRuns: this.trigger.preprocessRuns,
      internal,
      concurrencyLimit: typeof this.options.concurrencyLimit === "number" ? this.options.concurrencyLimit : typeof this.options.concurrencyLimit === "object" ? { id: this.options.concurrencyLimit.id, limit: this.options.concurrencyLimit.limit } : void 0
    };
  }
  async invoke(param1, param2 = void 0, param3 = void 0) {
    const triggerClient = this.client;
    if (!triggerClient) {
      throw new Error("Cannot invoke a job that is not attached to a client. Make sure you attach the job to a client before invoking it.");
    }
    const runStore = runLocalStorage.getStore();
    if (typeof param1 === "string") {
      if (!runStore) {
        throw new Error("Cannot invoke a job from outside of a run when passing a cacheKey. Make sure you are running the job from within a run or use the invoke method without the cacheKey.");
      }
      const options = param3 ?? {};
      return await runStore.io.runTask(param1, async (task) => {
        const result = await triggerClient.invokeJob(this.id, param2, {
          idempotencyKey: task.idempotencyKey,
          ...options
        });
        task.outputProperties = [
          {
            label: "Run",
            text: result.id,
            url: `/orgs/${runStore.ctx.organization.slug}/projects/${runStore.ctx.project.slug}/jobs/${this.id}/runs/${result.id}/trigger`
          }
        ];
        return result;
      }, {
        name: `Manually Invoke '${this.name}'`,
        params: param2,
        properties: [
          {
            label: "Job",
            text: this.id,
            url: `/orgs/${runStore.ctx.organization.slug}/projects/${runStore.ctx.project.slug}/jobs/${this.id}`
          },
          {
            label: "Env",
            text: runStore.ctx.environment.slug
          }
        ]
      });
    }
    if (runStore) {
      throw new Error("Cannot invoke a job from within a run without a cacheKey.");
    }
    return await triggerClient.invokeJob(this.id, param1, param2);
  }
  async invokeAndWaitForCompletion(cacheKey, payload, timeoutInSeconds = 60 * 60, options = {}) {
    const triggerClient = this.client;
    if (!triggerClient) {
      throw new Error("Cannot invoke a job that is not attached to a client. Make sure you attach the job to a client before invoking it.");
    }
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      throw new Error("Cannot invoke a job from outside of a run using invokeAndWaitForCompletion. Make sure you are running the job from within a run or use the invoke method instead.");
    }
    const { io, ctx } = runStore;
    return await io.runTask(cacheKey, async (task) => {
      const parsedPayload = this.trigger.event.parseInvokePayload ? this.trigger.event.parseInvokePayload(payload) ? payload : void 0 : payload;
      const result = await triggerClient.invokeJob(this.id, parsedPayload, {
        idempotencyKey: task.idempotencyKey,
        callbackUrl: task.callbackUrl ?? void 0,
        ...options
      });
      task.outputProperties = [
        {
          label: "Run",
          text: result.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}/runs/${result.id}/trigger`
        }
      ];
      return {};
    }, {
      name: `Manually Invoke '${this.name}' and wait for completion`,
      params: payload,
      properties: [
        {
          label: "Job",
          text: this.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}`
        },
        {
          label: "Env",
          text: ctx.environment.slug
        }
      ],
      callback: {
        enabled: true,
        timeoutInSeconds
      }
    });
  }
  async batchInvokeAndWaitForCompletion(cacheKey, batch) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      throw new Error("Cannot invoke a job from outside of a run using batchInvokeAndWaitForCompletion.");
    }
    if (batch.length === 0) {
      return [];
    }
    if (batch.length > 25) {
      throw new Error(`Cannot batch invoke more than 25 items. You tried to batch invoke ${batch.length} items.`);
    }
    const { io, ctx } = runStore;
    const results = await io.parallel(cacheKey, batch, async (item, index) => {
      return await this.invokeAndWaitForCompletion(String(index), item.payload, item.timeoutInSeconds ?? 60 * 60, item.options);
    }, {
      name: `Batch Invoke '${this.name}'`,
      properties: [
        {
          label: "Job",
          text: this.id,
          url: `/orgs/${ctx.organization.slug}/projects/${ctx.project.slug}/jobs/${this.id}`
        },
        {
          label: "Env",
          text: ctx.environment.slug
        }
      ]
    });
    return results;
  }
  // Make sure the id is valid (must only contain alphanumeric characters and dashes)
  // Make sure the version is valid (must be a valid semver version)
  #validate() {
    if (!this.version.match(/^(\d+)\.(\d+)\.(\d+)$/)) {
      throw new Error(`Invalid job version: "${this.version}". Job versions must be valid semver versions.`);
    }
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggerClient.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/logger.js
init_esm();
import { env } from "node:process";
import { Buffer } from "node:buffer";
var logLevels = ["log", "error", "warn", "info", "debug"];
var Logger = class _Logger {
  #name;
  #level;
  #filteredKeys = [];
  #jsonReplacer;
  #additionalFields;
  constructor(name, level = "info", filteredKeys = [], jsonReplacer, additionalFields) {
    this.#name = name;
    this.#level = logLevels.indexOf(env.TRIGGER_LOG_LEVEL ?? level);
    this.#filteredKeys = filteredKeys;
    this.#jsonReplacer = createReplacer(jsonReplacer);
    this.#additionalFields = additionalFields ?? (() => ({}));
  }
  child(fields) {
    return new _Logger(this.#name, logLevels[this.#level], this.#filteredKeys, this.#jsonReplacer, () => ({ ...this.#additionalFields(), ...fields }));
  }
  // Return a new Logger instance with the same name and a new log level
  // but filter out the keys from the log messages (at any level)
  filter(...keys) {
    return new _Logger(this.#name, logLevels[this.#level], keys, this.#jsonReplacer);
  }
  static satisfiesLogLevel(logLevel, setLevel) {
    return logLevels.indexOf(logLevel) <= logLevels.indexOf(setLevel);
  }
  log(message, ...args) {
    if (this.#level < 0)
      return;
    this.#structuredLog(console.log, message, "log", ...args);
  }
  error(message, ...args) {
    if (this.#level < 1)
      return;
    this.#structuredLog(console.error, message, "error", ...args);
  }
  warn(message, ...args) {
    if (this.#level < 2)
      return;
    this.#structuredLog(console.warn, message, "warn", ...args);
  }
  info(message, ...args) {
    if (this.#level < 3)
      return;
    this.#structuredLog(console.info, message, "info", ...args);
  }
  debug(message, ...args) {
    if (this.#level < 4)
      return;
    this.#structuredLog(console.debug, message, "debug", ...args);
  }
  #structuredLog(loggerFunction, message, level, ...args) {
    const currentSpan = trace.getSpan(context.active());
    const structuredLog = {
      ...structureArgs(safeJsonClone(args), this.#filteredKeys),
      ...this.#additionalFields(),
      timestamp: /* @__PURE__ */ new Date(),
      name: this.#name,
      message,
      level,
      traceId: currentSpan && currentSpan.isRecording() ? currentSpan?.spanContext().traceId : void 0,
      parentSpanId: currentSpan && currentSpan.isRecording() ? currentSpan?.spanContext().spanId : void 0
    };
    if (currentSpan && !currentSpan.isRecording() && level === "debug") {
      structuredLog.skipForwarding = true;
    }
    loggerFunction(JSON.stringify(structuredLog, this.#jsonReplacer));
  }
};
function createReplacer(replacer) {
  return (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    if (replacer) {
      return replacer(key, value);
    }
    return value;
  };
}
function bigIntReplacer(_key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}
function safeJsonClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj, bigIntReplacer));
  } catch (e) {
    return;
  }
}
function structureArgs(args, filteredKeys = []) {
  if (!args) {
    return;
  }
  if (args.length === 0) {
    return;
  }
  if (args.length === 1 && typeof args[0] === "object") {
    return filterKeys(JSON.parse(JSON.stringify(args[0], bigIntReplacer)), filteredKeys);
  }
  return args;
}
function filterKeys(obj, keys) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => filterKeys(item, keys));
  }
  const filteredObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key)) {
      if (value) {
        filteredObj[key] = `[filtered ${prettyPrintBytes(value)}]`;
      } else {
        filteredObj[key] = value;
      }
      continue;
    }
    filteredObj[key] = filterKeys(value, keys);
  }
  return filteredObj;
}
function prettyPrintBytes(value) {
  if (env.NODE_ENV === "production") {
    return "skipped size";
  }
  const sizeInBytes = getSizeInBytes(value);
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  }
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  }
  if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function getSizeInBytes(value) {
  const jsonString = JSON.stringify(value);
  return Buffer.byteLength(jsonString, "utf8");
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggerClient.js
import EventEmitter from "node:events";
import { env as env3 } from "node:process";

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/apiClient.js
init_esm();
import { env as env2 } from "node:process";

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/store/keyValueStoreClient.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/io.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+core@3.3.12_bufferutil@4.0.9/node_modules/@trigger.dev/core/dist/esm/bloom.js
init_esm();
import { Buffer as Buffer2 } from "node:buffer";
var BloomFilter = class _BloomFilter {
  size;
  bitArray;
  constructor(size) {
    this.size = size;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }
  add(item) {
    const index = murmurHash3(item) % this.size;
    const bitIndex = Math.floor(index / 8);
    if (this.bitArray[bitIndex] !== void 0) {
      this.bitArray[bitIndex] |= 1 << index % 8;
    }
  }
  test(item) {
    const index = murmurHash3(item) % this.size;
    const bitIndex = Math.floor(index / 8);
    return this.bitArray[bitIndex] !== void 0 && (this.bitArray[bitIndex] & 1 << index % 8) !== 0;
  }
  // Serialize to a Base64 string
  serialize() {
    return Buffer2.from(this.bitArray).toString("base64");
  }
  // Deserialize from a Base64 string
  static deserialize(str, size) {
    const filter = new _BloomFilter(size);
    filter.bitArray = Uint8Array.from(Buffer2.from(str, "base64"));
    return filter;
  }
  static NOOP_TASK_SET_SIZE = 32768;
};
function murmurHash3(str, seed = 0) {
  let h1 = 3735928559 ^ seed, h2 = 1103547991 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 3432918353);
    h1 = h1 << 15 | h1 >>> 17;
    h1 = Math.imul(h1, 461845907);
    h2 = Math.imul(h2 ^ ch, 2246822507);
    h2 = h2 << 13 | h2 >>> 19;
    h2 = Math.imul(h2, 3266489909);
  }
  h1 ^= str.length;
  h2 ^= str.length;
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 = Math.imul(h1 ^ h1 >>> 13, 3266489909);
  h1 ^= h1 >>> 16;
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 = Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 ^= h2 >>> 16;
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/io.js
import { AsyncLocalStorage as AsyncLocalStorage2 } from "node:async_hooks";
import { webcrypto } from "node:crypto";

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/retry.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/status.js
init_esm();
var TriggerStatus = class {
  id;
  io;
  constructor(id, io) {
    this.id = id;
    this.io = io;
  }
  async update(key, status) {
    const properties = [];
    if (status.label) {
      properties.push({
        label: "Label",
        text: status.label
      });
    }
    if (status.state) {
      properties.push({
        label: "State",
        text: status.state
      });
    }
    return await this.io.runTask(key, async (task) => {
      return await this.io.triggerClient.updateStatus(this.io.runId, this.id, status);
    }, {
      name: status.label ?? `Status update`,
      icon: "bell",
      params: {
        ...status
      },
      properties
    });
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/types.js
init_esm();
var EventSpecificationExampleSchema = z2.object({
  id: z2.string(),
  name: z2.string(),
  icon: z2.string().optional(),
  payload: z2.any()
});
function waitForEventSchema(schema) {
  return z2.object({
    id: z2.string(),
    name: z2.string(),
    source: z2.string(),
    payload: schema,
    timestamp: z2.coerce.date(),
    context: z2.any().optional(),
    accountId: z2.string().optional()
  });
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/store/keyValueStore.js
init_esm();
var KeyValueStore = class {
  apiClient;
  type;
  namespace;
  constructor(apiClient, type = null, namespace = "") {
    this.apiClient = apiClient;
    this.type = type;
    this.namespace = namespace;
  }
  #namespacedKey(key) {
    const parts = [];
    if (this.type) {
      parts.push(this.type);
    }
    if (this.namespace) {
      parts.push(this.namespace);
    }
    parts.push(key);
    return parts.join(":");
  }
  #sharedProperties(key) {
    return [
      {
        label: "namespace",
        text: this.type ?? "env"
      },
      {
        label: "key",
        text: key
      }
    ];
  }
  async delete(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.delete(this.#namespacedKey(param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.delete(this.#namespacedKey(param2));
    }, {
      name: "Key-Value Store Delete",
      icon: "database-minus",
      params: { key: param2 },
      properties: this.#sharedProperties(param2),
      style: { style: "minimal" }
    });
  }
  async get(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.get(this.#namespacedKey(param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.get(this.#namespacedKey(param2));
    }, {
      name: "Key-Value Store Get",
      icon: "database-export",
      params: { key: param2 },
      properties: this.#sharedProperties(param2),
      style: { style: "minimal" }
    });
  }
  async has(param1, param2) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.has(this.#namespacedKey(param1));
    }
    const { io } = runStore;
    if (!param2) {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.has(this.#namespacedKey(param2));
    }, {
      name: "Key-Value Store Has",
      icon: "database-search",
      params: { key: param2 },
      properties: this.#sharedProperties(param2),
      style: { style: "minimal" }
    });
  }
  async set(param1, param2, param3) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      if (typeof param1 !== "string") {
        throw new Error("Please use the store without a cacheKey when accessing from outside a run.");
      }
      return await this.apiClient.store.set(this.#namespacedKey(param1), param2);
    }
    const { io } = runStore;
    if (!param2 || typeof param2 !== "string") {
      throw new Error("Please provide a non-empty key when accessing the store from inside a run.");
    }
    const value = param3;
    return await io.runTask(param1, async (task) => {
      return await this.apiClient.store.set(this.#namespacedKey(param2), value);
    }, {
      name: "Key-Value Store Set",
      icon: "database-plus",
      params: { key: param2, value },
      properties: [
        ...this.#sharedProperties(param2),
        ...typeof value !== "object" || value === null ? [
          {
            label: "value",
            text: String(value) ?? "undefined"
          }
        ] : []
      ],
      style: { style: "minimal" }
    });
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/io.js
import { Buffer as Buffer3 } from "node:buffer";
var JSONOutputSerializer = class {
  serialize(value) {
    return JSON.stringify(value);
  }
  deserialize(value) {
    return value ? JSON.parse(value) : void 0;
  }
};
var IO = class {
  _id;
  _jobId;
  _apiClient;
  _triggerClient;
  _logger;
  _jobLogger;
  _jobLogLevel;
  _cachedTasks;
  _taskStorage;
  _cachedTasksCursor;
  _context;
  _yieldedExecutions;
  _noopTasksBloomFilter;
  _stats;
  _serverVersion;
  _timeOrigin;
  _executionTimeout;
  _outputSerializer = new JSONOutputSerializer();
  _visitedCacheKeys = /* @__PURE__ */ new Set();
  _envStore;
  _jobStore;
  _runStore;
  get stats() {
    return this._stats;
  }
  constructor(options) {
    this._id = options.id;
    this._jobId = options.jobId;
    this._apiClient = options.apiClient;
    this._triggerClient = options.client;
    this._logger = options.logger ?? new Logger("trigger.dev", options.logLevel);
    this._cachedTasks = /* @__PURE__ */ new Map();
    this._jobLogger = options.jobLogger;
    this._jobLogLevel = options.jobLogLevel;
    this._timeOrigin = options.timeOrigin;
    this._executionTimeout = options.executionTimeout;
    this._envStore = new KeyValueStore(options.apiClient);
    this._jobStore = new KeyValueStore(options.apiClient, "job", options.jobId);
    this._runStore = new KeyValueStore(options.apiClient, "run", options.id);
    this._stats = {
      initialCachedTasks: 0,
      lazyLoadedCachedTasks: 0,
      executedTasks: 0,
      cachedTaskHits: 0,
      cachedTaskMisses: 0,
      noopCachedTaskHits: 0,
      noopCachedTaskMisses: 0
    };
    if (options.cachedTasks) {
      options.cachedTasks.forEach((task) => {
        this._cachedTasks.set(task.idempotencyKey, task);
      });
      this._stats.initialCachedTasks = options.cachedTasks.length;
    }
    this._taskStorage = new AsyncLocalStorage2();
    this._context = options.context;
    this._yieldedExecutions = options.yieldedExecutions ?? [];
    if (options.noopTasksSet) {
      this._noopTasksBloomFilter = BloomFilter.deserialize(options.noopTasksSet, BloomFilter.NOOP_TASK_SET_SIZE);
    }
    this._cachedTasksCursor = options.cachedTasksCursor;
    this._serverVersion = options.serverVersion ?? "unversioned";
  }
  /** @internal */
  get runId() {
    return this._id;
  }
  /** @internal */
  get triggerClient() {
    return this._triggerClient;
  }
  /** Used to send log messages to the [Run log](https://trigger.dev/docs/documentation/guides/viewing-runs). */
  get logger() {
    return new IOLogger(async (level, message, data) => {
      let logLevel = "info";
      if (data instanceof Error) {
        data = {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }
      if (Logger.satisfiesLogLevel(logLevel, this._jobLogLevel)) {
        await this.runTask([message, level], async (task) => {
          switch (level) {
            case "LOG": {
              this._jobLogger?.log(message, data);
              logLevel = "log";
              break;
            }
            case "DEBUG": {
              this._jobLogger?.debug(message, data);
              logLevel = "debug";
              break;
            }
            case "INFO": {
              this._jobLogger?.info(message, data);
              logLevel = "info";
              break;
            }
            case "WARN": {
              this._jobLogger?.warn(message, data);
              logLevel = "warn";
              break;
            }
            case "ERROR": {
              this._jobLogger?.error(message, data);
              logLevel = "error";
              break;
            }
          }
        }, {
          name: "log",
          icon: "log",
          description: message,
          params: data,
          properties: [{ label: "Level", text: level }],
          style: { style: "minimal", variant: level.toLowerCase() },
          noop: true
        });
      }
    });
  }
  /** `io.random()` is identical to `Math.random()` when called without options but ensures your random numbers are not regenerated on resume or retry. It will return a pseudo-random floating-point number between optional `min` (default: 0, inclusive) and `max` (default: 1, exclusive). Can optionally `round` to the nearest integer.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param min Sets the lower bound (inclusive). Can't be higher than `max`.
   * @param max Sets the upper bound (exclusive). Can't be lower than `min`.
   * @param round Controls rounding to the nearest integer. Any `max` integer will become inclusive when enabled. Rounding with floating-point bounds may cause unexpected skew and boundary inclusivity.
   */
  async random(cacheKey, { min = 0, max = 1, round = false } = {}) {
    return await this.runTask(cacheKey, async (task) => {
      if (min > max) {
        throw new Error(`Lower bound can't be higher than upper bound - min: ${min}, max: ${max}`);
      }
      if (min === max) {
        await this.logger.warn(`Lower and upper bounds are identical. The return value is not random and will always be: ${min}`);
      }
      const withinBounds = (max - min) * Math.random() + min;
      if (!round) {
        return withinBounds;
      }
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        await this.logger.warn("Rounding enabled with floating-point bounds. This may cause unexpected skew and boundary inclusivity.");
      }
      const rounded = Math.round(withinBounds);
      return rounded;
    }, {
      name: "random",
      icon: "dice-5-filled",
      params: { min, max, round },
      properties: [
        ...min === 0 ? [] : [
          {
            label: "min",
            text: String(min)
          }
        ],
        ...max === 1 ? [] : [
          {
            label: "max",
            text: String(max)
          }
        ],
        ...round === false ? [] : [
          {
            label: "round",
            text: String(round)
          }
        ]
      ],
      style: { style: "minimal" }
    });
  }
  /** `io.wait()` waits for the specified amount of time before continuing the Job. Delays work even if you're on a serverless platform with timeouts, or if your server goes down. They utilize [resumability](https://trigger.dev/docs/documentation/concepts/resumability) to ensure that the Run can be resumed after the delay.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param seconds The number of seconds to wait. This can be very long, serverless timeouts are not an issue.
   */
  async wait(cacheKey, seconds) {
    return await this.runTask(cacheKey, async (task) => {
    }, {
      name: "wait",
      icon: "clock",
      params: { seconds },
      noop: true,
      delayUntil: new Date(Date.now() + seconds * 1e3),
      style: { style: "minimal" }
    });
  }
  async waitForEvent(cacheKey, event, options) {
    const timeoutInSeconds = options?.timeoutInSeconds ?? 60 * 60;
    return await this.runTask(cacheKey, async (task, io) => {
      if (!task.callbackUrl) {
        throw new Error("No callbackUrl found on task");
      }
      await this.triggerClient.createEphemeralEventDispatcher({
        url: task.callbackUrl,
        name: event.name,
        filter: event.filter,
        contextFilter: event.contextFilter,
        source: event.source,
        accountId: event.accountId,
        timeoutInSeconds
      });
      return {};
    }, {
      name: "Wait for Event",
      icon: "custom-event",
      params: {
        name: event.name,
        source: event.source,
        filter: event.filter,
        contextFilter: event.contextFilter,
        accountId: event.accountId
      },
      callback: {
        enabled: true,
        timeoutInSeconds
      },
      properties: [
        {
          label: "Event",
          text: event.name
        },
        {
          label: "Timeout",
          text: `${timeoutInSeconds}s`
        },
        ...event.source ? [{ label: "Source", text: event.source }] : [],
        ...event.accountId ? [{ label: "Account ID", text: event.accountId }] : []
      ],
      parseOutput: (output) => {
        return waitForEventSchema(event.schema ?? z2.any()).parse(output);
      }
    });
  }
  /** `io.waitForRequest()` allows you to pause the execution of a run until the url provided in the callback is POSTed to.
   *  This is useful for integrating with external services that require a callback URL to be provided, or if you want to be able to wait until an action is performed somewhere else in your system.
   *  @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   *  @param callback A callback function that will provide the unique URL to POST to.
   *  @param options Options for the callback.
   *  @param options.timeoutInSeconds How long to wait for the request to be POSTed to the callback URL before timing out. Defaults to 1hr.
   *  @returns The POSTed request JSON body.
   *  @example
   * ```ts
    const result = await io.waitForRequest<{ message: string }>(
      "wait-for-request",
      async (url, task) => {
        // Save the URL somewhere so you can POST to it later
        // Or send it to an external service that will POST to it
      },
      { timeoutInSeconds: 60 } // wait 60 seconds
    );
    * ```
   */
  async waitForRequest(cacheKey, callback, options) {
    const timeoutInSeconds = options?.timeoutInSeconds ?? 60 * 60;
    return await this.runTask(cacheKey, async (task, io) => {
      if (!task.callbackUrl) {
        throw new Error("No callbackUrl found on task");
      }
      task.outputProperties = [
        {
          label: "Callback URL",
          text: task.callbackUrl
        }
      ];
      return callback(task.callbackUrl);
    }, {
      name: "Wait for Request",
      icon: "clock",
      callback: {
        enabled: true,
        timeoutInSeconds: options?.timeoutInSeconds
      },
      properties: [
        {
          label: "Timeout",
          text: `${timeoutInSeconds}s`
        }
      ]
    });
  }
  /** `io.createStatus()` allows you to set a status with associated data during the Run. Statuses can be used by your UI using the react package
     * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
     * @param initialStatus The initial status you want this status to have. You can update it during the rub using the returned object.
     * @returns a TriggerStatus object that you can call `update()` on, to update the status.
     * @example
     * ```ts
     * client.defineJob(
    //...
      run: async (payload, io, ctx) => {
        const generatingImages = await io.createStatus("generating-images", {
          label: "Generating Images",
          state: "loading",
          data: {
            progress: 0.1,
          },
        });
  
        //...do stuff
  
        await generatingImages.update("completed-generation", {
          label: "Generated images",
          state: "success",
          data: {
            progress: 1.0,
            urls: ["http://..."]
          },
        });
  
      //...
    });
     * ```
    */
  async createStatus(cacheKey, initialStatus) {
    const id = typeof cacheKey === "string" ? cacheKey : cacheKey.join("-");
    const status = new TriggerStatus(id, this);
    await status.update(cacheKey, initialStatus);
    return status;
  }
  /** `io.backgroundFetch()` fetches data from a URL that can take longer that the serverless timeout. The actual `fetch` request is performed on the Trigger.dev platform, and the response is sent back to you.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param url The URL to fetch from.
   * @param requestInit The options for the request
   * @param retry The options for retrying the request if it fails
   * An object where the key is a status code pattern and the value is a retrying strategy.
   * Supported patterns are:
   * - Specific status codes: 429
   * - Ranges: 500-599
   * - Wildcards: 2xx, 3xx, 4xx, 5xx
   */
  async backgroundFetch(cacheKey, url, requestInit, options) {
    const urlObject = new URL(url);
    return await this.runTask(cacheKey, async (task) => {
      console.log("task context", task.context);
      return task.output;
    }, {
      name: `fetch ${urlObject.hostname}${urlObject.pathname}`,
      params: { url, requestInit, retry: options?.retry, timeout: options?.timeout },
      operation: "fetch",
      icon: "background",
      noop: false,
      properties: [
        {
          label: "url",
          text: url,
          url
        },
        {
          label: "method",
          text: requestInit?.method ?? "GET"
        },
        {
          label: "background",
          text: "true"
        },
        ...options?.timeout ? [{ label: "timeout", text: `${options.timeout.durationInMs}ms` }] : []
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.backgroundPoll()` will fetch data from a URL on an interval. The actual `fetch` requests are performed on the Trigger.dev server, so you don't have to worry about serverless function timeouts.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param params The options for the background poll
   * @param params.url The URL to fetch from.
   * @param params.requestInit The options for the request, like headers and method
   * @param params.responseFilter An [EventFilter](https://trigger.dev/docs/documentation/guides/event-filter) that allows you to specify when to stop polling.
   * @param params.interval The interval in seconds to poll the URL in seconds. Defaults to 10 seconds which is the minimum.
   * @param params.timeout The timeout in seconds for each request in seconds. Defaults to 10 minutes. Minimum is 60 seconds and max is 1 hour
   * @param params.requestTimeout An optional object that allows you to timeout individual fetch requests
   * @param params.requestTimeout An optional object that allows you to timeout individual fetch requests
   * @param params.requestTimeout.durationInMs The duration in milliseconds to timeout the request
   *
   * @example
   * ```ts
   * const result = await io.backgroundPoll<{ id: string; status: string; }>("poll", {
      url: `http://localhost:3030/api/v1/runs/${run.id}`,
      requestInit: {
        headers: {
          Accept: "application/json",
          Authorization: redactString`Bearer ${process.env["TRIGGER_API_KEY"]!}`,
        },
      },
      interval: 10,
      timeout: 600,
      responseFilter: {
        status: [200],
        body: {
          status: ["SUCCESS"],
        },
      },
    });
    * ```
   */
  async backgroundPoll(cacheKey, params) {
    const urlObject = new URL(params.url);
    return await this.runTask(cacheKey, async (task) => {
      return task.output;
    }, {
      name: `poll ${urlObject.hostname}${urlObject.pathname}`,
      params,
      operation: "fetch-poll",
      icon: "clock-bolt",
      noop: false,
      properties: [
        {
          label: "url",
          text: params.url
        },
        {
          label: "interval",
          text: `${params.interval}s`
        },
        {
          label: "timeout",
          text: `${params.timeout}s`
        }
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.backgroundFetchResponse()` fetches data from a URL that can take longer that the serverless timeout. The actual `fetch` request is performed on the Trigger.dev platform, and the response is sent back to you.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param url The URL to fetch from.
   * @param requestInit The options for the request
   * @param retry The options for retrying the request if it fails
   * An object where the key is a status code pattern and the value is a retrying strategy.
   * Supported patterns are:
   * - Specific status codes: 429
   * - Ranges: 500-599
   * - Wildcards: 2xx, 3xx, 4xx, 5xx
   */
  async backgroundFetchResponse(cacheKey, url, requestInit, options) {
    const urlObject = new URL(url);
    return await this.runTask(cacheKey, async (task) => {
      return task.output;
    }, {
      name: `fetch response ${urlObject.hostname}${urlObject.pathname}`,
      params: { url, requestInit, retry: options?.retry, timeout: options?.timeout },
      operation: "fetch-response",
      icon: "background",
      noop: false,
      properties: [
        {
          label: "url",
          text: url,
          url
        },
        {
          label: "method",
          text: requestInit?.method ?? "GET"
        },
        {
          label: "background",
          text: "true"
        },
        ...options?.timeout ? [{ label: "timeout", text: `${options.timeout.durationInMs}ms` }] : []
      ],
      retry: {
        limit: 0
      }
    });
  }
  /** `io.sendEvent()` allows you to send an event from inside a Job run. The sent event will trigger any Jobs that are listening for that event (based on the name).
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param event The event to send. The event name must match the name of the event that your Jobs are listening for.
   * @param options Options for sending the event.
   */
  async sendEvent(cacheKey, event, options) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.sendEvent(event, options);
    }, {
      name: "Send Event",
      params: { event, options },
      icon: "send",
      properties: [
        {
          label: "name",
          text: event.name
        },
        ...event?.id ? [{ label: "ID", text: event.id }] : [],
        ...sendEventOptionsProperties(options)
      ]
    });
  }
  /** `io.sendEvents()` allows you to send multiple events from inside a Job run. The sent events will trigger any Jobs that are listening for those events (based on the name).
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param event The events to send. The event names must match the names of the events that your Jobs are listening for.
   * @param options Options for sending the events.
   */
  async sendEvents(cacheKey, events, options) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.sendEvents(events, options);
    }, {
      name: "Send Multiple Events",
      params: { events, options },
      icon: "send",
      properties: [
        {
          label: "Total Events",
          text: String(events.length)
        },
        ...sendEventOptionsProperties(options)
      ]
    });
  }
  async getEvent(cacheKey, id) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.getEvent(id);
    }, {
      name: "getEvent",
      params: { id },
      properties: [
        {
          label: "id",
          text: id
        }
      ]
    });
  }
  /** `io.cancelEvent()` allows you to cancel an event that was previously sent with `io.sendEvent()`. This will prevent any Jobs from running that are listening for that event if the event was sent with a delay
   * @param cacheKey
   * @param eventId
   * @returns
   */
  async cancelEvent(cacheKey, eventId) {
    return await this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.cancelEvent(eventId);
    }, {
      name: "cancelEvent",
      params: {
        eventId
      },
      properties: [
        {
          label: "id",
          text: eventId
        }
      ]
    });
  }
  async updateSource(cacheKey, options) {
    return this.runTask(cacheKey, async (task) => {
      return await this._apiClient.updateSource(this._triggerClient.id, options.key, options);
    }, {
      name: "Update Source",
      description: "Update Source",
      properties: [
        {
          label: "key",
          text: options.key
        }
      ],
      params: options,
      redact: {
        paths: ["secret"]
      }
    });
  }
  async updateWebhook(cacheKey, options) {
    return this.runTask(cacheKey, async (task) => {
      return await this._apiClient.updateWebhook(options.key, options);
    }, {
      name: "Update Webhook Source",
      icon: "refresh",
      properties: [
        {
          label: "key",
          text: options.key
        }
      ],
      params: options
    });
  }
  /** `io.registerInterval()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular interval.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
   * @param id A unique id for the interval. This is used to identify and unregister the interval later.
   * @param options The options for the interval.
   * @returns A promise that has information about the interval.
   * @deprecated Use `DynamicSchedule.register` instead.
   */
  async registerInterval(cacheKey, dynamicSchedule, id, options) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.register(id, {
        type: "interval",
        options
      });
    }, {
      name: "register-interval",
      properties: [
        { label: "schedule", text: dynamicSchedule.id },
        { label: "id", text: id },
        { label: "seconds", text: options.seconds.toString() }
      ],
      params: options
    });
  }
  /** `io.unregisterInterval()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerInterval()`.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
   * @param id A unique id for the interval. This is used to identify and unregister the interval later.
   * @deprecated Use `DynamicSchedule.unregister` instead.
   */
  async unregisterInterval(cacheKey, dynamicSchedule, id) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.unregister(id);
    }, {
      name: "unregister-interval",
      properties: [
        { label: "schedule", text: dynamicSchedule.id },
        { label: "id", text: id }
      ]
    });
  }
  /** `io.registerCron()` allows you to register a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that will trigger any jobs it's attached to on a regular CRON schedule.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to register a new schedule on.
   * @param id A unique id for the schedule. This is used to identify and unregister the schedule later.
   * @param options The options for the CRON schedule.
   * @deprecated Use `DynamicSchedule.register` instead.
   */
  async registerCron(cacheKey, dynamicSchedule, id, options) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.register(id, {
        type: "cron",
        options
      });
    }, {
      name: "register-cron",
      properties: [
        { label: "schedule", text: dynamicSchedule.id },
        { label: "id", text: id },
        { label: "cron", text: options.cron }
      ],
      params: options
    });
  }
  /** `io.unregisterCron()` allows you to unregister a [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) that was previously registered with `io.registerCron()`.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param dynamicSchedule The [DynamicSchedule](https://trigger.dev/docs/sdk/dynamicschedule) to unregister a schedule on.
   * @param id A unique id for the interval. This is used to identify and unregister the interval later.
   * @deprecated Use `DynamicSchedule.unregister` instead.
   */
  async unregisterCron(cacheKey, dynamicSchedule, id) {
    return await this.runTask(cacheKey, async (task) => {
      return dynamicSchedule.unregister(id);
    }, {
      name: "unregister-cron",
      properties: [
        { label: "schedule", text: dynamicSchedule.id },
        { label: "id", text: id }
      ]
    });
  }
  /** `io.registerTrigger()` allows you to register a [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) with the specified trigger params.
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param trigger The [DynamicTrigger](https://trigger.dev/docs/sdk/dynamictrigger) to register.
   * @param id A unique id for the trigger. This is used to identify and unregister the trigger later.
   * @param params The params for the trigger.
   * @deprecated Use `DynamicTrigger.register` instead.
   */
  async registerTrigger(cacheKey, trigger, id, params) {
    return await this.runTask(cacheKey, async (task) => {
      const registration = await this.runTask("register-source", async (subtask1) => {
        return trigger.register(id, params);
      }, {
        name: "register-source"
      });
      return {
        id: registration.id,
        key: registration.source.key
      };
    }, {
      name: "register-trigger",
      properties: [
        { label: "trigger", text: trigger.id },
        { label: "id", text: id }
      ],
      params
    });
  }
  async getAuth(cacheKey, clientId) {
    if (!clientId) {
      return;
    }
    return this.runTask(cacheKey, async (task) => {
      return await this._triggerClient.getAuth(clientId);
    }, { name: "get-auth" });
  }
  async parallel(cacheKey, items, callback, options) {
    const results = await this.runTask(cacheKey, async (task) => {
      const outcomes = await Promise.allSettled(items.map((item, index) => spaceOut(() => callback(item, index), index, 15)));
      if (outcomes.every((outcome) => outcome.status === "fulfilled")) {
        return outcomes.map((outcome) => outcome.value);
      }
      const nonInternalErrors = outcomes.filter((outcome) => outcome.status === "rejected" && !isTriggerError(outcome.reason)).map((outcome) => outcome);
      if (nonInternalErrors.length > 0) {
        throw nonInternalErrors[0].reason;
      }
      const internalErrors = outcomes.filter((outcome) => outcome.status === "rejected" && isTriggerError(outcome.reason)).map((outcome) => outcome).map((outcome) => outcome.reason);
      throw new ResumeWithParallelTaskError(task, internalErrors);
    }, {
      name: "parallel",
      parallel: true,
      ...options ?? {}
    });
    return results;
  }
  /** `io.runTask()` allows you to run a [Task](https://trigger.dev/docs/documentation/concepts/tasks) from inside a Job run. A Task is a resumable unit of a Run that can be retried, resumed and is logged. [Integrations](https://trigger.dev/docs/integrations) use Tasks internally to perform their actions.
   *
   * @param cacheKey Should be a stable and unique key inside the `run()`. See [resumability](https://trigger.dev/docs/documentation/concepts/resumability) for more information.
   * @param callback The callback that will be called when the Task is run. The callback receives the Task and the IO as parameters.
   * @param options The options of how you'd like to run and log the Task.
   * @param onError The callback that will be called when the Task fails. The callback receives the error, the Task and the IO as parameters. If you wish to retry then return an object with a `retryAt` property.
   * @returns A Promise that resolves with the returned value of the callback.
   */
  async runTask(cacheKey, callback, options, onError) {
    const parentId = this._taskStorage.getStore()?.taskId;
    if (parentId) {
      this._logger.debug("Using parent task", {
        parentId,
        cacheKey,
        options
      });
    }
    const isSubtaskNoop = options?.noop === true && parentId !== void 0;
    if (!isSubtaskNoop) {
      this.#detectAutoYield("start_task", 500);
    }
    const idempotencyKey = await generateIdempotencyKey([this._id, parentId ?? "", cacheKey].flat());
    if (this._visitedCacheKeys.has(idempotencyKey)) {
      if (typeof cacheKey === "string") {
        throw new Error(`Task with cacheKey "${cacheKey}" has already been executed in this run. Each task must have a unique cacheKey.`);
      } else {
        throw new Error(`Task with cacheKey "${cacheKey.join("-")}" has already been executed in this run. Each task must have a unique cacheKey.`);
      }
    }
    this._visitedCacheKeys.add(idempotencyKey);
    const cachedTask = this._cachedTasks.get(idempotencyKey);
    if (cachedTask && cachedTask.status === "COMPLETED") {
      this._logger.debug("Using completed cached task", {
        idempotencyKey
      });
      this._stats.cachedTaskHits++;
      return options?.parseOutput ? options.parseOutput(cachedTask.output) : cachedTask.output;
    }
    if (options?.noop && this._noopTasksBloomFilter) {
      if (this._noopTasksBloomFilter.test(idempotencyKey)) {
        this._logger.debug("task idempotency key exists in noopTasksBloomFilter", {
          idempotencyKey
        });
        this._stats.noopCachedTaskHits++;
        return {};
      }
    }
    const runOptions = { ...options ?? {}, parseOutput: void 0 };
    const response = await this.#doRunTask({
      idempotencyKey,
      displayKey: typeof cacheKey === "string" ? cacheKey : void 0,
      noop: false,
      ...runOptions ?? {},
      parentId
    });
    if (!response) {
      this.#forceYield("failed_task_run");
      throw new Error("Failed to run task");
    }
    const task = response.version === API_VERSIONS.LAZY_LOADED_CACHED_TASKS ? response.body.task : response.body;
    if (task.forceYield) {
      this._logger.debug("Forcing yield after run task", {
        idempotencyKey
      });
      this.#forceYield("after_run_task");
    }
    if (response.version === API_VERSIONS.LAZY_LOADED_CACHED_TASKS) {
      this._cachedTasksCursor = response.body.cachedTasks?.cursor;
      for (const cachedTask2 of response.body.cachedTasks?.tasks ?? []) {
        if (!this._cachedTasks.has(cachedTask2.idempotencyKey)) {
          this._cachedTasks.set(cachedTask2.idempotencyKey, cachedTask2);
          this._logger.debug("Injecting lazy loaded task into task cache", {
            idempotencyKey: cachedTask2.idempotencyKey
          });
          this._stats.lazyLoadedCachedTasks++;
        }
      }
    }
    if (task.status === "CANCELED") {
      this._logger.debug("Task canceled", {
        idempotencyKey,
        task
      });
      throw new CanceledWithTaskError(task);
    }
    if (task.status === "COMPLETED") {
      if (task.noop) {
        this._logger.debug("Noop Task completed", {
          idempotencyKey
        });
        this._noopTasksBloomFilter?.add(task.idempotencyKey);
      } else {
        this._logger.debug("Cache miss", {
          idempotencyKey
        });
        this._stats.cachedTaskMisses++;
        this.#addToCachedTasks(task);
      }
      return options?.parseOutput ? options.parseOutput(task.output) : task.output;
    }
    if (task.status === "ERRORED") {
      this._logger.debug("Task errored", {
        idempotencyKey,
        task
      });
      throw new ErrorWithTask(task, task.error ?? task?.output ? JSON.stringify(task.output) : "Task errored");
    }
    this.#detectAutoYield("before_execute_task", 1500);
    const executeTask = async () => {
      try {
        const result = await callback(task, this);
        if (task.status === "WAITING" && task.callbackUrl) {
          this._logger.debug("Waiting for remote callback", {
            idempotencyKey,
            task
          });
          return {};
        }
        const output = this._outputSerializer.serialize(result);
        this._logger.debug("Completing using output", {
          idempotencyKey,
          task
        });
        this.#detectAutoYield("before_complete_task", 500, task, output);
        const completedTask = await this.#doCompleteTask(task.id, {
          output,
          properties: task.outputProperties ?? void 0
        });
        if (!completedTask) {
          this.#forceYield("before_complete_task", task, output);
          throw new Error("Failed to complete task");
        }
        if (completedTask.forceYield) {
          this._logger.debug("Forcing yield after task completed", {
            idempotencyKey
          });
          this.#forceYield("after_complete_task");
        }
        this._stats.executedTasks++;
        if (completedTask.status === "CANCELED") {
          throw new CanceledWithTaskError(completedTask);
        }
        this.#detectAutoYield("after_complete_task", 500);
        const deserializedOutput = this._outputSerializer.deserialize(output);
        return options?.parseOutput ? options.parseOutput(deserializedOutput) : deserializedOutput;
      } catch (error) {
        if (isTriggerError(error)) {
          throw error;
        }
        let skipRetrying = false;
        if (onError) {
          try {
            const onErrorResult = onError(error, task, this);
            if (onErrorResult) {
              if (onErrorResult instanceof Error) {
                error = onErrorResult;
              } else {
                skipRetrying = !!onErrorResult.skipRetrying;
                if (onErrorResult.retryAt && !skipRetrying) {
                  const parsedError2 = ErrorWithStackSchema.safeParse(onErrorResult.error);
                  throw new RetryWithTaskError(parsedError2.success ? parsedError2.data : { message: "Unknown error" }, task, onErrorResult.retryAt);
                }
              }
            }
          } catch (innerError) {
            if (isTriggerError(innerError)) {
              throw innerError;
            }
            error = innerError;
          }
        }
        if (error instanceof ErrorWithTask) {
          await this._apiClient.failTask(this._id, task.id, {
            error: error.cause.output
          });
          throw error;
        }
        const parsedError = ErrorWithStackSchema.safeParse(error);
        if (options?.retry && !skipRetrying) {
          const retryAt = calculateRetryAt(options.retry, task.attempts - 1);
          if (retryAt) {
            throw new RetryWithTaskError(parsedError.success ? parsedError.data : { message: "Unknown error" }, task, retryAt);
          }
        }
        if (parsedError.success) {
          await this._apiClient.failTask(this._id, task.id, {
            error: parsedError.data
          });
        } else {
          const message = typeof error === "string" ? error : JSON.stringify(error);
          await this._apiClient.failTask(this._id, task.id, {
            error: { name: "Unknown error", message }
          });
        }
        throw error;
      }
    };
    if (task.status === "WAITING") {
      this._logger.debug("Task waiting", {
        idempotencyKey,
        task
      });
      if (task.callbackUrl) {
        await this._taskStorage.run({ taskId: task.id }, executeTask);
      }
      throw new ResumeWithTaskError(task);
    }
    if (task.status === "RUNNING" && typeof task.operation === "string") {
      this._logger.debug("Task running operation", {
        idempotencyKey,
        task
      });
      throw new ResumeWithTaskError(task);
    }
    return this._taskStorage.run({ taskId: task.id }, executeTask);
  }
  /**
   * `io.yield()` allows you to yield execution of the current run and resume it in a new function execution. Similar to `io.wait()` but does not create a task and resumes execution immediately.
   */
  yield(cacheKey) {
    if (!supportsFeature("yieldExecution", this._serverVersion)) {
      console.warn("[trigger.dev] io.yield() is not support by the version of the Trigger.dev server you are using, you will need to upgrade your self-hosted Trigger.dev instance.");
      return;
    }
    if (this._yieldedExecutions.includes(cacheKey)) {
      return;
    }
    throw new YieldExecutionError(cacheKey);
  }
  /**
   * `io.brb()` is an alias of `io.yield()`
   */
  brb = this.yield.bind(this);
  /** `io.try()` allows you to run Tasks and catch any errors that are thrown, it's similar to a normal `try/catch` block but works with [io.runTask()](https://trigger.dev/docs/sdk/io/runtask).
   * A regular `try/catch` block on its own won't work as expected with Tasks. Internally `runTask()` throws some special errors to control flow execution. This is necessary to deal with resumability, serverless timeouts, and retrying Tasks.
   * @param tryCallback The code you wish to run
   * @param catchCallback Thhis will be called if the Task fails. The callback receives the error
   * @returns A Promise that resolves with the returned value or the error
   */
  async try(tryCallback, catchCallback) {
    try {
      return await tryCallback();
    } catch (error) {
      if (isTriggerError(error)) {
        throw error;
      }
      return await catchCallback(error);
    }
  }
  get store() {
    return {
      env: this._envStore,
      job: this._jobStore,
      run: this._runStore
    };
  }
  #addToCachedTasks(task) {
    this._cachedTasks.set(task.idempotencyKey, task);
  }
  async #doRunTask(task) {
    try {
      return await this._apiClient.runTask(this._id, task, {
        cachedTasksCursor: this._cachedTasksCursor
      });
    } catch (error) {
      if (error instanceof AutoYieldRateLimitError) {
        this._logger.debug("AutoYieldRateLimitError", {
          error
        });
        throw error;
      }
      return;
    }
  }
  async #doCompleteTask(id, task) {
    try {
      return await this._apiClient.completeTask(this._id, id, task);
    } catch (error) {
      return;
    }
  }
  #detectAutoYield(location, threshold = 1500, task, output) {
    const timeRemaining = this.#getRemainingTimeInMillis();
    if (timeRemaining && timeRemaining < threshold) {
      if (task) {
        throw new AutoYieldWithCompletedTaskExecutionError(task.id, task.outputProperties ?? [], {
          location,
          timeRemaining,
          timeElapsed: this.#getTimeElapsed()
        }, output);
      } else {
        throw new AutoYieldExecutionError(location, timeRemaining, this.#getTimeElapsed());
      }
    }
  }
  #forceYield(location, task, output) {
    const timeRemaining = this.#getRemainingTimeInMillis();
    if (timeRemaining) {
      if (task) {
        throw new AutoYieldWithCompletedTaskExecutionError(task.id, task.outputProperties ?? [], {
          location,
          timeRemaining,
          timeElapsed: this.#getTimeElapsed()
        }, output);
      } else {
        throw new AutoYieldExecutionError(location, timeRemaining, this.#getTimeElapsed());
      }
    }
  }
  #getTimeElapsed() {
    return performance.now() - this._timeOrigin;
  }
  #getRemainingTimeInMillis() {
    if (this._executionTimeout) {
      return this._executionTimeout - (performance.now() - this._timeOrigin);
    }
    return void 0;
  }
};
async function generateIdempotencyKey(keyMaterial) {
  const keys = keyMaterial.map((key2) => {
    if (typeof key2 === "string") {
      return key2;
    }
    return stableStringify(key2);
  });
  const key = keys.join(":");
  const hash = await webcrypto.subtle.digest("SHA-256", Buffer3.from(key));
  return Buffer3.from(hash).toString("hex");
}
function stableStringify(obj) {
  function sortKeys(obj2) {
    if (typeof obj2 !== "object" || obj2 === null) {
      return obj2;
    }
    if (Array.isArray(obj2)) {
      return obj2.map(sortKeys);
    }
    const sortedKeys = Object.keys(obj2).sort();
    const sortedObj2 = {};
    for (const key of sortedKeys) {
      sortedObj2[key] = sortKeys(obj2[key]);
    }
    return sortedObj2;
  }
  const sortedObj = sortKeys(obj);
  return JSON.stringify(sortedObj);
}
var IOLogger = class {
  callback;
  constructor(callback) {
    this.callback = callback;
  }
  /** Log: essential messages */
  log(message, properties) {
    return this.callback("LOG", message, properties);
  }
  /** For debugging: the least important log level */
  debug(message, properties) {
    return this.callback("DEBUG", message, properties);
  }
  /** Info: the second least important log level */
  info(message, properties) {
    return this.callback("INFO", message, properties);
  }
  /** Warnings: the third most important log level  */
  warn(message, properties) {
    return this.callback("WARN", message, properties);
  }
  /** Error: The second most important log level */
  error(message, properties) {
    return this.callback("ERROR", message, properties);
  }
};
async function spaceOut(callback, index, delay) {
  await new Promise((resolve) => setTimeout(resolve, index * delay));
  return await callback();
}
function sendEventOptionsProperties(options) {
  return [
    ...options?.accountId ? [{ label: "Account ID", text: options.accountId }] : [],
    ...options?.deliverAfter ? [{ label: "Deliver After", text: `${options.deliverAfter}s` }] : [],
    ...options?.deliverAt ? [{ label: "Deliver At", text: options.deliverAt.toISOString() }] : []
  ];
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/store/keyValueStoreClient.js
var KeyValueStoreClient = class {
  queryStore;
  type;
  namespace;
  #serializer = new JSONOutputSerializer();
  constructor(queryStore, type = null, namespace = "") {
    this.queryStore = queryStore;
    this.type = type;
    this.namespace = namespace;
  }
  #namespacedKey(key) {
    const parts = [];
    if (this.type) {
      parts.push(this.type);
    }
    if (this.namespace) {
      parts.push(this.namespace);
    }
    parts.push(key);
    return parts.join(":");
  }
  async delete(key) {
    const result = await this.queryStore("DELETE", {
      key: this.#namespacedKey(key)
    });
    if (result.action !== "DELETE") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return result.deleted;
  }
  async get(key) {
    const result = await this.queryStore("GET", {
      key: this.#namespacedKey(key)
    });
    if (result.action !== "GET") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return this.#serializer.deserialize(result.value);
  }
  async has(key) {
    const result = await this.queryStore("HAS", {
      key: this.#namespacedKey(key)
    });
    if (result.action !== "HAS") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return result.has;
  }
  async set(key, value) {
    const result = await this.queryStore("SET", {
      key: this.#namespacedKey(key),
      value: this.#serializer.serialize(value)
    });
    if (result.action !== "SET") {
      throw new Error(`Unexpected key-value store response: ${result.action}`);
    }
    return this.#serializer.deserialize(result.value);
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/apiClient.js
var UnknownVersionError = class extends Error {
  constructor(version) {
    super(`Unknown version ${version}`);
  }
};
var MAX_RETRIES = 8;
var EXPONENT_FACTOR = 2;
var MIN_DELAY_IN_MS = 80;
var MAX_DELAY_IN_MS = 2e3;
var JITTER_IN_MS = 50;
var ApiClient = class {
  #apiUrl;
  #options;
  #logger;
  #storeClient;
  constructor(options) {
    this.#options = options;
    this.#apiUrl = this.#options.apiUrl ?? env2.TRIGGER_API_URL ?? "https://api.trigger.dev";
    this.#logger = new Logger("trigger.dev", this.#options.logLevel);
    this.#storeClient = new KeyValueStoreClient(this.#queryKeyValueStore.bind(this));
  }
  async registerEndpoint(options) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Registering endpoint", {
      url: options.url,
      name: options.name
    });
    const response = await fetch(`${this.#apiUrl}/api/v1/endpoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: options.url,
        name: options.name
      })
    });
    if (response.status >= 400 && response.status < 500) {
      const body = await response.json();
      throw new Error(body.error);
    }
    if (response.status !== 200) {
      throw new Error(`Failed to register entry point, got status code ${response.status}`);
    }
    return await response.json();
  }
  async runTask(runId, task, options = {}) {
    const apiKey = await this.#apiKey();
    this.#logger.debug(`[ApiClient] runTask ${task.displayKey}`);
    return await zodfetchWithVersions(this.#logger, {
      [API_VERSIONS.LAZY_LOADED_CACHED_TASKS]: RunTaskResponseWithCachedTasksBodySchema
    }, ServerTaskSchema, `${this.#apiUrl}/api/v1/runs/${runId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": task.idempotencyKey,
        "X-Cached-Tasks-Cursor": options.cachedTasksCursor ?? "",
        "Trigger-Version": API_VERSIONS.LAZY_LOADED_CACHED_TASKS
      },
      body: JSON.stringify(task)
    });
  }
  async completeTask(runId, id, task) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Complete Task", {
      task
    });
    return await zodfetch(ServerTaskSchema, `${this.#apiUrl}/api/v1/runs/${runId}/tasks/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Trigger-Version": API_VERSIONS.SERIALIZED_TASK_OUTPUT
      },
      body: JSON.stringify(task)
    });
  }
  async failTask(runId, id, body) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Fail Task", {
      id,
      runId,
      body
    });
    return await zodfetch(ServerTaskSchema, `${this.#apiUrl}/api/v1/runs/${runId}/tasks/${id}/fail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
  }
  async sendEvent(event, options = {}) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Sending event", {
      event
    });
    return await zodfetch(ApiEventLogSchema, `${this.#apiUrl}/api/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ event, options })
    });
  }
  async sendEvents(events, options = {}) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Sending multiple events", {
      events
    });
    return await zodfetch(ApiEventLogSchema.array(), `${this.#apiUrl}/api/v1/events/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ events, options })
    });
  }
  async cancelEvent(eventId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Cancelling event", {
      eventId
    });
    return await zodfetch(ApiEventLogSchema, `${this.#apiUrl}/api/v1/events/${eventId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async cancelRunsForEvent(eventId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Cancelling runs for event", {
      eventId
    });
    return await zodfetch(CancelRunsForEventSchema, `${this.#apiUrl}/api/v1/events/${eventId}/cancel-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async updateStatus(runId, id, status) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Update status", {
      id,
      status
    });
    return await zodfetch(JobRunStatusRecordSchema, `${this.#apiUrl}/api/v1/runs/${runId}/statuses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(status)
    });
  }
  async updateSource(client2, key, source) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("activating http source", {
      source
    });
    const response = await zodfetch(TriggerSourceSchema, `${this.#apiUrl}/api/v2/${client2}/sources/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(source)
    });
    return response;
  }
  async updateWebhook(key, webhookData) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("activating webhook", {
      webhookData
    });
    const response = await zodfetch(TriggerSourceSchema, `${this.#apiUrl}/api/v1/webhooks/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(webhookData)
    });
    return response;
  }
  async registerTrigger(client2, id, key, payload, idempotencyKey) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("registering trigger", {
      id,
      payload
    });
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    };
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const response = await zodfetch(RegisterSourceEventSchemaV2, `${this.#apiUrl}/api/v2/${client2}/triggers/${id}/registrations/${key}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload)
    });
    return response;
  }
  async registerSchedule(client2, id, key, payload) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("registering schedule", {
      id,
      payload
    });
    const response = await zodfetch(RegisterScheduleResponseBodySchema, `${this.#apiUrl}/api/v1/${client2}/schedules/${id}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ id: key, ...payload })
    });
    return response;
  }
  async unregisterSchedule(client2, id, key) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("unregistering schedule", {
      id
    });
    const response = await zodfetch(z2.object({ ok: z2.boolean() }), `${this.#apiUrl}/api/v1/${client2}/schedules/${id}/registrations/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
    return response;
  }
  async getAuth(client2, id) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("getting auth", {
      id
    });
    const response = await zodfetch(ConnectionAuthSchema, `${this.#apiUrl}/api/v1/${client2}/auth/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    }, {
      optional: true
    });
    return response;
  }
  async getEvent(eventId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Getting Event", {
      eventId
    });
    return await zodfetch(GetEventSchema, `${this.#apiUrl}/api/v2/events/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRun(runId, options) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Getting Run", {
      runId
    });
    return await zodfetch(GetRunSchema, urlWithSearchParams(`${this.#apiUrl}/api/v2/runs/${runId}`, options), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async cancelRun(runId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Cancelling Run", {
      runId
    });
    return await zodfetch(GetRunSchema, `${this.#apiUrl}/api/v1/runs/${runId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRunStatuses(runId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Getting Run statuses", {
      runId
    });
    return await zodfetch(GetRunStatusesSchema, `${this.#apiUrl}/api/v2/runs/${runId}/statuses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async getRuns(jobSlug, options) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Getting Runs", {
      jobSlug
    });
    return await zodfetch(GetRunsSchema, urlWithSearchParams(`${this.#apiUrl}/api/v1/jobs/${jobSlug}/runs`, options), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async invokeJob(jobId, payload, options = {}) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Invoking Job", {
      jobId
    });
    const body = {
      payload,
      context: options.context ?? {},
      options: {
        accountId: options.accountId,
        callbackUrl: options.callbackUrl
      }
    };
    return await zodfetch(InvokeJobResponseSchema, `${this.#apiUrl}/api/v1/jobs/${jobId}/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}
      },
      body: JSON.stringify(body)
    });
  }
  async cancelRunsForJob(jobId) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Cancelling Runs for Job", {
      jobId
    });
    return await zodfetch(CancelRunsForJobSchema, `${this.#apiUrl}/api/v1/jobs/${jobId}/cancel-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    });
  }
  async createEphemeralEventDispatcher(payload) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("Creating ephemeral event dispatcher", {
      payload
    });
    const response = await zodfetch(EphemeralEventDispatcherResponseBodySchema, `${this.#apiUrl}/api/v1/event-dispatchers/ephemeral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    return response;
  }
  get store() {
    return this.#storeClient;
  }
  async #queryKeyValueStore(action, data) {
    const apiKey = await this.#apiKey();
    this.#logger.debug("accessing key-value store", {
      action,
      data
    });
    const encodedKey = encodeURIComponent(data.key);
    const STORE_URL = `${this.#apiUrl}/api/v1/store/${encodedKey}`;
    const authHeader = {
      Authorization: `Bearer ${apiKey}`
    };
    let requestInit;
    switch (action) {
      case "DELETE": {
        requestInit = {
          method: "DELETE",
          headers: authHeader
        };
        break;
      }
      case "GET": {
        requestInit = {
          method: "GET",
          headers: authHeader
        };
        break;
      }
      case "HAS": {
        const headResponse = await fetchHead(STORE_URL, {
          headers: authHeader
        });
        return {
          action: "HAS",
          key: encodedKey,
          has: !!headResponse.ok
        };
      }
      case "SET": {
        const MAX_BODY_BYTE_LENGTH = 256 * 1024;
        if ((data.value?.length ?? 0) > MAX_BODY_BYTE_LENGTH) {
          throw new Error(`Max request body size exceeded: ${MAX_BODY_BYTE_LENGTH} bytes`);
        }
        requestInit = {
          method: "PUT",
          headers: {
            ...authHeader,
            "Content-Type": "text/plain"
          },
          body: data.value
        };
        break;
      }
      default: {
        assertExhaustive(action);
      }
    }
    const response = await zodfetch(KeyValueStoreResponseBodySchema, STORE_URL, requestInit);
    return response;
  }
  async #apiKey() {
    const apiKey = getApiKey(this.#options.apiKey);
    if (apiKey.status === "invalid") {
      throw new Error("Invalid API key");
    } else if (apiKey.status === "missing") {
      throw new Error("Missing API key");
    }
    return apiKey.apiKey;
  }
};
function getApiKey(key) {
  const apiKey = key ?? env2.TRIGGER_API_KEY;
  if (!apiKey) {
    return { status: "missing" };
  }
  const isValid2 = apiKey.match(/^tr_[a-z]+_[a-zA-Z0-9]+$/);
  if (!isValid2) {
    return { status: "invalid", apiKey };
  }
  return { status: "valid", apiKey };
}
async function zodfetchWithVersions(logger, versionedSchemaMap, unversionedSchema, url, requestInit, options, retryCount = 0) {
  try {
    const fullRequestInit = requestInitWithCache(requestInit);
    const response = await fetch(url, fullRequestInit);
    logger.debug(`[ApiClient] zodfetchWithVersions ${url} (attempt ${retryCount + 1})`, {
      url,
      retryCount,
      requestHeaders: fullRequestInit?.headers,
      responseHeaders: Object.fromEntries(response.headers.entries())
    });
    if ((!requestInit || requestInit.method === "GET") && response.status === 404 && options?.optional) {
      return;
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("x-ratelimit-reset");
      if (retryAfter) {
        throw new AutoYieldRateLimitError(parseInt(retryAfter));
      }
    }
    if (response.status >= 400 && response.status < 500) {
      const rawBody = await safeResponseText(response);
      const body = safeJsonParse(rawBody);
      logger.error(`[ApiClient] zodfetchWithVersions failed with ${response.status}`, {
        url,
        retryCount,
        requestHeaders: fullRequestInit?.headers,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        status: response.status,
        rawBody
      });
      if (body && body.error) {
        throw new Error(body.error);
      } else {
        throw new Error(rawBody);
      }
    }
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = exponentialBackoff(retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return zodfetchWithVersions(logger, versionedSchemaMap, unversionedSchema, url, requestInit, options, retryCount + 1);
    }
    if (response.status !== 200) {
      const rawBody = await safeResponseText(response);
      logger.error(`[ApiClient] zodfetchWithVersions failed with ${response.status}`, {
        url,
        retryCount,
        requestHeaders: fullRequestInit?.headers,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        status: response.status,
        rawBody
      });
      throw new Error(options?.errorMessage ?? `Failed to fetch ${url}, got status code ${response.status}`);
    }
    const jsonBody = await response.json();
    const version = response.headers.get("trigger-version");
    if (!version) {
      return {
        version: "unversioned",
        body: unversionedSchema.parse(jsonBody)
      };
    }
    const versionedSchema = versionedSchemaMap[version];
    if (!versionedSchema) {
      throw new UnknownVersionError(version);
    }
    return {
      version,
      body: versionedSchema.parse(jsonBody)
    };
  } catch (error) {
    if (error instanceof UnknownVersionError || error instanceof AutoYieldRateLimitError) {
      throw error;
    }
    logger.error(`[ApiClient] zodfetchWithVersions failed with a connection error`, {
      url,
      retryCount,
      error
    });
    if (retryCount < MAX_RETRIES) {
      const delay = exponentialBackoff(retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return zodfetchWithVersions(logger, versionedSchemaMap, unversionedSchema, url, requestInit, options, retryCount + 1);
    }
    throw error;
  }
}
function requestInitWithCache(requestInit) {
  try {
    const withCache = {
      ...requestInit,
      cache: "no-cache"
    };
    const _ = new Request("http://localhost", withCache);
    return withCache;
  } catch (error) {
    return requestInit ?? {};
  }
}
async function fetchHead(url, requestInitWithoutMethod, retryCount = 0) {
  const requestInit = {
    ...requestInitWithoutMethod,
    method: "HEAD"
  };
  const response = await fetch(url, requestInitWithCache(requestInit));
  if (response.status >= 500 && retryCount < MAX_RETRIES) {
    const delay = exponentialBackoff(retryCount + 1);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchHead(url, requestInitWithoutMethod, retryCount + 1);
  }
  return response;
}
async function zodfetch(schema, url, requestInit, options, retryCount = 0) {
  try {
    const response = await fetch(url, requestInitWithCache(requestInit));
    if ((!requestInit || requestInit.method === "GET") && response.status === 404 && options?.optional) {
      return;
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("x-ratelimit-reset");
      if (retryAfter) {
        throw new AutoYieldRateLimitError(parseInt(retryAfter));
      }
    }
    if (response.status >= 400 && response.status < 500) {
      const body = await response.json();
      throw new Error(body.error);
    }
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = exponentialBackoff(retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return zodfetch(schema, url, requestInit, options, retryCount + 1);
    }
    if (response.status !== 200) {
      throw new Error(options?.errorMessage ?? `Failed to fetch ${url}, got status code ${response.status}`);
    }
    const jsonBody = await response.json();
    return schema.parse(jsonBody);
  } catch (error) {
    if (error instanceof AutoYieldRateLimitError) {
      throw error;
    }
    if (retryCount < MAX_RETRIES) {
      const delay = exponentialBackoff(retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return zodfetch(schema, url, requestInit, options, retryCount + 1);
    }
    throw error;
  }
}
function exponentialBackoff(retryCount) {
  const delay = Math.min(Math.pow(EXPONENT_FACTOR, retryCount) * MIN_DELAY_IN_MS, MAX_DELAY_IN_MS);
  const jitterValue = Math.random() * JITTER_IN_MS;
  return delay + jitterValue;
}
function safeJsonParse(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return;
  }
}
async function safeResponseText(response) {
  try {
    return await response.text();
  } catch (error) {
    return "";
  }
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/concurrencyLimit.js
init_esm();
var ConcurrencyLimit = class {
  options;
  constructor(options) {
    this.options = options;
  }
  get id() {
    return this.options.id;
  }
  get limit() {
    return this.options.limit;
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/httpEndpoint.js
init_esm();
var HttpEndpoint = class {
  options;
  constructor(options) {
    this.options = options;
  }
  get id() {
    return this.options.id;
  }
  onRequest(options) {
    return new HttpTrigger({
      endpointId: this.id,
      event: this.options.event,
      filter: options?.filter,
      verify: this.options.verify
    });
  }
  // @internal
  async handleRequest(request) {
    if (!this.options.respondWith)
      return;
    return this.options.respondWith.handler(request, () => {
      const clonedRequest = request.clone();
      return this.options.verify(clonedRequest);
    });
  }
  toJSON() {
    return {
      id: this.id,
      icon: this.options.event.icon,
      version: "1",
      enabled: this.options.enabled ?? true,
      event: this.options.event,
      immediateResponseFilter: this.options.respondWith?.filter,
      skipTriggeringRuns: this.options.respondWith?.skipTriggeringRuns,
      source: this.options.event.source
    };
  }
};
var HttpTrigger = class {
  options;
  constructor(options) {
    this.options = options;
  }
  toJSON() {
    return {
      type: "static",
      title: this.options.endpointId,
      properties: this.options.event.properties,
      rule: {
        event: `httpendpoint.${this.options.endpointId}`,
        payload: this.options.filter ?? {},
        source: this.options.event.source
      },
      link: `http-endpoints/${this.options.endpointId}`,
      help: {
        noRuns: {
          text: "To start triggering runs click here to setup your HTTP Endpoint with the external API service you want to receive webhooks from.",
          link: `http-endpoints/${this.options.endpointId}`
        }
      }
    };
  }
  get event() {
    return this.options.event;
  }
  attachToJob(triggerClient, job) {
  }
  get preprocessRuns() {
    return false;
  }
  async verifyPayload(payload) {
    const clonedRequest = payload.clone();
    return this.options.verify(clonedRequest);
  }
};
function httpEndpoint(options) {
  const id = slugifyId(options.id);
  return new HttpEndpoint({
    id,
    enabled: options.enabled,
    respondWith: options.respondWith,
    verify: options.verify,
    event: {
      name: id,
      title: options.title ?? "HTTP Trigger",
      source: options.source,
      icon: options.icon ?? "webhook",
      properties: options.properties,
      examples: options.examples ? options.examples : [
        {
          id: "basic-request",
          name: "Basic Request",
          icon: "http-post",
          payload: {
            url: "https://cloud.trigger.dev",
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            rawBody: JSON.stringify({
              foo: "bar"
            })
          }
        }
      ],
      parsePayload: (rawPayload) => {
        const result = RequestWithRawBodySchema.safeParse(rawPayload);
        if (!result.success) {
          throw new ParsedPayloadSchemaError(formatSchemaErrors(result.error.issues));
        }
        return new Request(new URL(result.data.url), {
          method: result.data.method,
          headers: result.data.headers,
          body: result.data.rawBody
        });
      }
    }
  });
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/ioWithIntegrations.js
init_esm();
function createIOWithIntegrations(io, auths, integrations) {
  if (!integrations) {
    return io;
  }
  const connections = Object.entries(integrations).reduce((acc, [connectionKey, integration]) => {
    let auth = auths?.[connectionKey];
    acc[connectionKey] = {
      integration,
      auth
    };
    return acc;
  }, {});
  return new Proxy(io, {
    get(target, prop, receiver) {
      if (prop === "__io") {
        return io;
      }
      if (typeof prop === "string" && prop in connections) {
        const { integration, auth } = connections[prop];
        return integration.cloneForRun(io, prop, auth);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value == "function" ? value.bind(target) : value;
    }
  });
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/dynamic.js
init_esm();
var DynamicTrigger = class {
  #client;
  #options;
  source;
  /** `DynamicTrigger` allows you to define a trigger that can be configured dynamically at runtime.
   * @param client The `TriggerClient` instance to use for registering the trigger.
   * @param options The options for the dynamic trigger.
   * */
  constructor(client2, options) {
    this.#client = client2;
    this.#options = options;
    this.source = options.source;
    client2.attachDynamicTrigger(this);
  }
  toJSON() {
    return {
      type: "dynamic",
      id: this.#options.id
    };
  }
  get id() {
    return this.#options.id;
  }
  get event() {
    return this.#options.event;
  }
  // @internal
  registeredTriggerForParams(params, options = {}) {
    const key = slugifyId(this.source.key(params));
    return {
      rule: {
        event: this.event.name,
        source: this.event.source,
        payload: deepMergeFilters(this.source.filter(params), this.event.filter ?? {}, options.filter ?? {})
      },
      source: {
        version: "2",
        key,
        channel: this.source.channel,
        params,
        //todo add other options here
        options: {
          event: typeof this.event.name === "string" ? [this.event.name] : this.event.name
        },
        integration: {
          id: this.source.integration.id,
          metadata: this.source.integration.metadata,
          authSource: this.source.integration.authSource
        }
      },
      accountId: options.accountId
    };
  }
  /** Use this method to register a new configuration with the DynamicTrigger.
   * @param key The key for the configuration. This will be used to identify the configuration when it is triggered.
   * @param params The params for the configuration.
   * @param options Options for the configuration.
   * @param options.accountId The accountId to associate with the configuration.
   * @param options.filter The filter to use for the configuration.
   *
   */
  async register(key, params, options = {}) {
    const runStore = runLocalStorage.getStore();
    if (!runStore) {
      return this.#client.registerTrigger(this.id, key, this.registeredTriggerForParams(params, options));
    }
    const { io } = runStore;
    return await io.runTask([key, "register"], async (task) => {
      return this.#client.registerTrigger(this.id, key, this.registeredTriggerForParams(params, options), task.idempotencyKey);
    }, {
      name: "Register Dynamic Trigger",
      properties: [
        { label: "Dynamic Trigger ID", text: this.id },
        { label: "ID", text: key }
      ],
      params
    });
  }
  attachToJob(triggerClient, job) {
    triggerClient.attachJobToDynamicTrigger(job, this);
  }
  get preprocessRuns() {
    return true;
  }
  async verifyPayload(payload) {
    return { success: true };
  }
};

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggerClient.js
var registerWebhookEvent = (key) => ({
  name: `${REGISTER_WEBHOOK}.${key}`,
  title: "Register Webhook",
  source: "internal",
  icon: "webhook",
  parsePayload: RegisterWebhookPayloadSchema.parse
});
var registerSourceEvent = {
  name: REGISTER_SOURCE_EVENT_V2,
  title: "Register Source",
  source: "internal",
  icon: "register-source",
  parsePayload: RegisterSourceEventSchemaV2.parse
};
var TriggerClient = class {
  #options;
  #registeredJobs = {};
  #registeredSources = {};
  #registeredWebhooks = {};
  #registeredHttpSourceHandlers = {};
  #registeredWebhookSourceHandlers = {};
  #registeredDynamicTriggers = {};
  #jobMetadataByDynamicTriggers = {};
  #registeredSchedules = {};
  #registeredHttpEndpoints = {};
  #authResolvers = {};
  #envStore;
  #eventEmitter = new EventEmitter();
  #client;
  #internalLogger;
  id;
  constructor(options) {
    this.id = options.id;
    this.#options = options;
    this.#internalLogger = new Logger("trigger.dev", this.#options.verbose ? "debug" : "log", [
      "output",
      "noopTasksSet"
    ]);
    this.#client = new ApiClient({
      logLevel: this.#options.verbose ? "debug" : "log",
      ...this.#options
    });
    this.#envStore = new KeyValueStore(this.#client);
  }
  on = this.#eventEmitter.on.bind(this.#eventEmitter);
  async handleRequest(request, timeOrigin = performance.now()) {
    this.#internalLogger.debug("handling request", {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method
    });
    const apiKey = request.headers.get("x-trigger-api-key");
    const triggerVersion = request.headers.get("x-trigger-version");
    const authorization = this.authorized(apiKey);
    switch (authorization) {
      case "authorized": {
        break;
      }
      case "missing-client": {
        return {
          status: 401,
          body: {
            message: "Unauthorized: client missing apiKey"
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "missing-header": {
        return {
          status: 401,
          body: {
            message: "Unauthorized: missing x-trigger-api-key header"
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "unauthorized": {
        return {
          status: 401,
          body: {
            message: `Forbidden: client apiKey mismatch: Make sure you are using the correct API Key for your environment`
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
    }
    if (request.method !== "POST") {
      return {
        status: 405,
        body: {
          message: "Method not allowed (only POST is allowed)"
        },
        headers: this.#standardResponseHeaders(timeOrigin)
      };
    }
    const action = request.headers.get("x-trigger-action");
    if (!action) {
      return {
        status: 400,
        body: {
          message: "Missing x-trigger-action header"
        },
        headers: this.#standardResponseHeaders(timeOrigin)
      };
    }
    switch (action) {
      case "PING": {
        const endpointId = request.headers.get("x-trigger-endpoint-id");
        if (!endpointId) {
          return {
            status: 200,
            body: {
              ok: false,
              error: "Missing endpoint ID"
            },
            headers: this.#standardResponseHeaders(timeOrigin)
          };
        }
        if (this.id !== endpointId) {
          return {
            status: 200,
            body: {
              ok: false,
              error: `Endpoint ID mismatch error. Expected ${this.id}, got ${endpointId}`
            },
            headers: this.#standardResponseHeaders(timeOrigin)
          };
        }
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "INDEX_ENDPOINT": {
        const body = {
          jobs: this.#buildJobsIndex(),
          sources: Object.values(this.#registeredSources),
          webhooks: Object.values(this.#registeredWebhooks),
          dynamicTriggers: Object.values(this.#registeredDynamicTriggers).map((trigger) => ({
            id: trigger.id,
            jobs: this.#jobMetadataByDynamicTriggers[trigger.id] ?? [],
            registerSourceJob: {
              id: dynamicTriggerRegisterSourceJobId(trigger.id),
              version: trigger.source.version
            }
          })),
          dynamicSchedules: Object.entries(this.#registeredSchedules).map(([id, jobs]) => ({
            id,
            jobs
          })),
          httpEndpoints: Object.entries(this.#registeredHttpEndpoints).map(([id, endpoint]) => endpoint.toJSON())
        };
        return {
          status: 200,
          body,
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "INITIALIZE_TRIGGER": {
        const json = await request.json();
        const body = InitializeTriggerBodySchema.safeParse(json);
        if (!body.success) {
          return {
            status: 400,
            body: {
              message: "Invalid trigger body"
            }
          };
        }
        const dynamicTrigger = this.#registeredDynamicTriggers[body.data.id];
        if (!dynamicTrigger) {
          return {
            status: 404,
            body: {
              message: "Dynamic trigger not found"
            }
          };
        }
        return {
          status: 200,
          body: dynamicTrigger.registeredTriggerForParams(body.data.params),
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "EXECUTE_JOB": {
        const json = await request.json();
        const execution = RunJobBodySchema.safeParse(json);
        if (!execution.success) {
          return {
            status: 400,
            body: {
              message: "Invalid execution"
            }
          };
        }
        const job = this.#registeredJobs[execution.data.job.id];
        if (!job) {
          return {
            status: 404,
            body: {
              message: "Job not found"
            }
          };
        }
        const results = await this.#executeJob(execution.data, job, timeOrigin, triggerVersion);
        this.#internalLogger.debug("executed job", {
          results,
          job: job.id,
          version: job.version,
          triggerVersion
        });
        const standardHeaders = this.#standardResponseHeaders(timeOrigin);
        standardHeaders["x-trigger-run-metadata"] = this.#serializeRunMetadata(job);
        return {
          status: 200,
          body: results,
          headers: standardHeaders
        };
      }
      case "PREPROCESS_RUN": {
        const json = await request.json();
        const body = PreprocessRunBodySchema.safeParse(json);
        if (!body.success) {
          return {
            status: 400,
            body: {
              message: "Invalid body"
            }
          };
        }
        const job = this.#registeredJobs[body.data.job.id];
        if (!job) {
          return {
            status: 404,
            body: {
              message: "Job not found"
            }
          };
        }
        const results = await this.#preprocessRun(body.data, job);
        return {
          status: 200,
          body: {
            abort: results.abort,
            properties: results.properties
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "DELIVER_HTTP_SOURCE_REQUEST": {
        const headers = HttpSourceRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error) {
          }
        }
        const sourceRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const dynamicId = headers.data["x-ts-dynamic-id"];
        const secret = headers.data["x-ts-secret"];
        const params = headers.data["x-ts-params"];
        const data = headers.data["x-ts-data"];
        const auth = headers.data["x-ts-auth"];
        const inputMetadata = headers.data["x-ts-metadata"];
        const source = {
          key,
          dynamicId,
          secret,
          params,
          data,
          auth,
          metadata: inputMetadata
        };
        const { response, events, metadata } = await this.#handleHttpSourceRequest(source, sourceRequest);
        return {
          status: 200,
          body: {
            events,
            response,
            metadata
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "DELIVER_HTTP_ENDPOINT_REQUEST_FOR_RESPONSE": {
        const headers = HttpEndpointRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error) {
          }
        }
        const sourceRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const { response } = await this.#handleHttpEndpointRequestForResponse({
          key
        }, sourceRequest);
        return {
          status: 200,
          body: response,
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "DELIVER_WEBHOOK_REQUEST": {
        const headers = WebhookSourceRequestHeadersSchema.safeParse(Object.fromEntries(request.headers.entries()));
        if (!headers.success) {
          return {
            status: 400,
            body: {
              message: "Invalid headers"
            }
          };
        }
        const sourceRequestNeedsBody = headers.data["x-ts-http-method"] !== "GET";
        const sourceRequestInit = {
          method: headers.data["x-ts-http-method"],
          headers: headers.data["x-ts-http-headers"],
          body: sourceRequestNeedsBody ? request.body : void 0
        };
        if (sourceRequestNeedsBody) {
          try {
            sourceRequestInit.duplex = "half";
          } catch (error2) {
          }
        }
        const webhookRequest = new Request(headers.data["x-ts-http-url"], sourceRequestInit);
        const key = headers.data["x-ts-key"];
        const secret = headers.data["x-ts-secret"];
        const params = headers.data["x-ts-params"];
        const ctx = {
          key,
          secret,
          params
        };
        const { response, verified, error } = await this.#handleWebhookRequest(webhookRequest, ctx);
        return {
          status: 200,
          body: {
            response,
            verified,
            error
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "VALIDATE": {
        return {
          status: 200,
          body: {
            ok: true,
            endpointId: this.id
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "PROBE_EXECUTION_TIMEOUT": {
        const json = await request.json();
        const timeout = json?.timeout ?? 15 * 60 * 1e3;
        await new Promise((resolve) => setTimeout(resolve, timeout));
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
      case "RUN_NOTIFICATION": {
        const rawJson = await request.json();
        const runNotification = rawJson;
        if (runNotification.ok) {
          await this.#deliverSuccessfulRunNotification(runNotification);
        } else {
          await this.#deliverFailedRunNotification(runNotification);
        }
        return {
          status: 200,
          body: {
            ok: true
          },
          headers: this.#standardResponseHeaders(timeOrigin)
        };
      }
    }
    return {
      status: 405,
      body: {
        message: "Method not allowed"
      },
      headers: this.#standardResponseHeaders(timeOrigin)
    };
  }
  defineJob(options) {
    const existingRegisteredJob = this.#registeredJobs[options.id];
    if (existingRegisteredJob && options.__internal !== true) {
      console.warn(`[@trigger.dev/sdk] Warning: The Job "${existingRegisteredJob.id}" you're attempting to define has already been defined. Please assign a different ID to the job.`);
    }
    const job = new Job(options);
    this.attach(job);
    return job;
  }
  defineAuthResolver(integration, resolver) {
    this.#authResolvers[integration.id] = resolver;
    return this;
  }
  defineDynamicSchedule(options) {
    return new DynamicSchedule(this, options);
  }
  defineDynamicTrigger(options) {
    return new DynamicTrigger(this, options);
  }
  /**
   * An [HTTP endpoint](https://trigger.dev/docs/documentation/concepts/http-endpoints) allows you to create a [HTTP Trigger](https://trigger.dev/docs/documentation/concepts/triggers/http), which means you can trigger your Jobs from any webhooks.
   * @param options The Endpoint options
   * @returns An HTTP Endpoint, that can be used to create an HTTP Trigger.
   * @link https://trigger.dev/docs/documentation/concepts/http-endpoints
   */
  defineHttpEndpoint(options, suppressWarnings = false) {
    const existingHttpEndpoint = this.#registeredHttpEndpoints[options.id];
    if (!suppressWarnings && existingHttpEndpoint) {
      console.warn(`[@trigger.dev/sdk] Warning: The HttpEndpoint "${existingHttpEndpoint.id}" you're attempting to define has already been defined. Please assign a different ID to the HttpEndpoint.`);
    }
    const endpoint = httpEndpoint(options);
    this.#registeredHttpEndpoints[endpoint.id] = endpoint;
    return endpoint;
  }
  defineConcurrencyLimit(options) {
    return new ConcurrencyLimit(options);
  }
  attach(job) {
    this.#registeredJobs[job.id] = job;
    job.trigger.attachToJob(this, job);
    job.client = this;
  }
  attachDynamicTrigger(trigger) {
    this.#registeredDynamicTriggers[trigger.id] = trigger;
    this.defineJob({
      id: dynamicTriggerRegisterSourceJobId(trigger.id),
      name: `Register dynamic trigger ${trigger.id}`,
      version: trigger.source.version,
      trigger: new EventTrigger({
        event: registerSourceEvent,
        filter: { dynamicTriggerId: [trigger.id] }
      }),
      integrations: {
        integration: trigger.source.integration
      },
      run: async (event, io, ctx) => {
        const updates = await trigger.source.register(event.source.params, event, io, ctx);
        if (!updates) {
          return;
        }
        return await io.updateSource("update-source", {
          key: event.source.key,
          ...updates
        });
      },
      __internal: true
    });
  }
  attachJobToDynamicTrigger(job, trigger) {
    const jobs = this.#jobMetadataByDynamicTriggers[trigger.id] ?? [];
    jobs.push({ id: job.id, version: job.version });
    this.#jobMetadataByDynamicTriggers[trigger.id] = jobs;
  }
  attachSource(options) {
    this.#registeredHttpSourceHandlers[options.key] = async (s, r) => {
      return await options.source.handle(s, r, this.#internalLogger);
    };
    let registeredSource = this.#registeredSources[options.key];
    if (!registeredSource) {
      registeredSource = {
        version: "2",
        channel: options.source.channel,
        key: options.key,
        params: options.params,
        options: {},
        integration: {
          id: options.source.integration.id,
          metadata: options.source.integration.metadata,
          authSource: options.source.integration.authSource
        },
        registerSourceJob: {
          id: options.key,
          version: options.source.version
        }
      };
    }
    const newOptions = deepMergeOptions({
      event: typeof options.event.name === "string" ? [options.event.name] : options.event.name
    }, options.options ?? {});
    registeredSource.options = deepMergeOptions(registeredSource.options, newOptions);
    this.#registeredSources[options.key] = registeredSource;
    this.defineJob({
      id: options.key,
      name: options.key,
      version: options.source.version,
      trigger: new EventTrigger({
        event: registerSourceEvent,
        filter: { source: { key: [options.key] } }
      }),
      integrations: {
        integration: options.source.integration
      },
      run: async (event, io, ctx) => {
        const updates = await options.source.register(options.params, event, io, ctx);
        if (!updates) {
          return;
        }
        return await io.updateSource("update-source", {
          key: options.key,
          ...updates
        });
      },
      __internal: true
    });
  }
  attachDynamicSchedule(key) {
    const jobs = this.#registeredSchedules[key] ?? [];
    this.#registeredSchedules[key] = jobs;
  }
  attachDynamicScheduleToJob(key, job) {
    const jobs = this.#registeredSchedules[key] ?? [];
    jobs.push({ id: job.id, version: job.version });
    this.#registeredSchedules[key] = jobs;
  }
  attachWebhook(options) {
    const { source } = options;
    this.#registeredWebhookSourceHandlers[options.key] = {
      verify: source.verify.bind(source),
      generateEvents: source.generateEvents.bind(source)
    };
    let registeredWebhook = this.#registeredWebhooks[options.key];
    if (!registeredWebhook) {
      registeredWebhook = {
        key: options.key,
        params: options.params,
        config: options.config,
        integration: {
          id: source.integration.id,
          metadata: source.integration.metadata,
          authSource: source.integration.authSource
        },
        httpEndpoint: {
          id: options.key
        }
      };
    } else {
      registeredWebhook.config = deepMergeOptions(registeredWebhook.config, options.config);
    }
    this.#registeredWebhooks[options.key] = registeredWebhook;
    this.defineJob({
      id: `webhook.register.${options.key}`,
      name: `webhook.register.${options.key}`,
      version: source.version,
      trigger: new EventTrigger({
        event: registerWebhookEvent(options.key)
      }),
      integrations: {
        integration: source.integration
      },
      run: async (registerPayload, io, ctx) => {
        return await io.try(async () => {
          this.#internalLogger.debug("[webhook.register] Start");
          const crudOptions = {
            io,
            // this is just a more strongly typed payload
            ctx: registerPayload
          };
          if (!registerPayload.active) {
            this.#internalLogger.debug("[webhook.register] Not active, run create");
            await io.try(async () => {
              await source.crud.create(crudOptions);
            }, async (error) => {
              this.#internalLogger.debug("[webhook.register] Error during create, re-trying with delete first", { error });
              await io.runTask("create-retry", async () => {
                await source.crud.delete(crudOptions);
                await source.crud.create(crudOptions);
              });
            });
            return await io.updateWebhook("update-webhook-success", {
              key: options.key,
              active: true,
              config: registerPayload.config.desired
            });
          }
          this.#internalLogger.debug("[webhook.register] Already active, run update");
          if (source.crud.update) {
            await source.crud.update(crudOptions);
          } else {
            this.#internalLogger.debug("[webhook.register] Run delete and create instead of update");
            await source.crud.delete(crudOptions);
            await source.crud.create(crudOptions);
          }
          return await io.updateWebhook("update-webhook-success", {
            key: options.key,
            active: true,
            config: registerPayload.config.desired
          });
        }, async (error) => {
          this.#internalLogger.debug("[webhook.register] Error", { error });
          await io.updateWebhook("update-webhook-error", {
            key: options.key,
            active: false
          });
          throw error;
        });
      },
      __internal: true
    });
  }
  async registerTrigger(id, key, options, idempotencyKey) {
    return this.#client.registerTrigger(this.id, id, key, options, idempotencyKey);
  }
  async getAuth(id) {
    return this.#client.getAuth(this.id, id);
  }
  /** You can call this function from anywhere in your backend to send an event. The other way to send an event is by using [`io.sendEvent()`](https://trigger.dev/docs/sdk/io/sendevent) from inside a `run()` function.
   * @param event The event to send.
   * @param options Options for sending the event.
   * @returns A promise that resolves to the event details
   */
  async sendEvent(event, options) {
    return this.#client.sendEvent(event, options);
  }
  /** You can call this function from anywhere in your backend to send multiple events. The other way to send multiple events is by using [`io.sendEvents()`](https://trigger.dev/docs/sdk/io/sendevents) from inside a `run()` function.
   * @param events The events to send.
   * @param options Options for sending the events.
   * @returns A promise that resolves to an array of event details
   */
  async sendEvents(events, options) {
    return this.#client.sendEvents(events, options);
  }
  async cancelEvent(eventId) {
    return this.#client.cancelEvent(eventId);
  }
  async cancelRunsForEvent(eventId) {
    return this.#client.cancelRunsForEvent(eventId);
  }
  async updateStatus(runId, id, status) {
    return this.#client.updateStatus(runId, id, status);
  }
  async registerSchedule(id, key, schedule) {
    return this.#client.registerSchedule(this.id, id, key, schedule);
  }
  async unregisterSchedule(id, key) {
    return this.#client.unregisterSchedule(this.id, id, key);
  }
  async getEvent(eventId) {
    return this.#client.getEvent(eventId);
  }
  async getRun(runId, options) {
    return this.#client.getRun(runId, options);
  }
  async cancelRun(runId) {
    return this.#client.cancelRun(runId);
  }
  async getRuns(jobSlug, options) {
    return this.#client.getRuns(jobSlug, options);
  }
  async getRunStatuses(runId) {
    return this.#client.getRunStatuses(runId);
  }
  async invokeJob(jobId, payload, options) {
    return this.#client.invokeJob(jobId, payload, options);
  }
  async cancelRunsForJob(jobId) {
    return this.#client.cancelRunsForJob(jobId);
  }
  async createEphemeralEventDispatcher(payload) {
    return this.#client.createEphemeralEventDispatcher(payload);
  }
  get store() {
    return {
      env: this.#envStore
    };
  }
  authorized(apiKey) {
    if (typeof apiKey !== "string") {
      return "missing-header";
    }
    const localApiKey = this.#options.apiKey ?? env3.TRIGGER_API_KEY;
    if (!localApiKey) {
      return "missing-client";
    }
    return apiKey === localApiKey ? "authorized" : "unauthorized";
  }
  apiKey() {
    return this.#options.apiKey ?? env3.TRIGGER_API_KEY;
  }
  async #preprocessRun(body, job) {
    const context2 = this.#createPreprocessRunContext(body);
    const parsedPayload = job.trigger.event.parsePayload(body.event.payload ?? {});
    const properties = job.trigger.event.runProperties?.(parsedPayload) ?? [];
    return {
      abort: false,
      properties
    };
  }
  async #executeJob(body, job, timeOrigin, triggerVersion) {
    this.#internalLogger.debug("executing job", {
      execution: body,
      job: job.id,
      version: job.version,
      triggerVersion
    });
    const context2 = this.#createRunContext(body);
    const io = new IO({
      id: body.run.id,
      jobId: job.id,
      cachedTasks: body.tasks,
      cachedTasksCursor: body.cachedTaskCursor,
      yieldedExecutions: body.yieldedExecutions ?? [],
      noopTasksSet: body.noopTasksSet,
      apiClient: this.#client,
      logger: this.#internalLogger,
      client: this,
      context: context2,
      jobLogLevel: job.logLevel ?? this.#options.logLevel ?? "info",
      jobLogger: this.#options.ioLogLocalEnabled ? new Logger(job.id, job.logLevel ?? this.#options.logLevel ?? "info") : void 0,
      serverVersion: triggerVersion,
      timeOrigin,
      executionTimeout: body.runChunkExecutionLimit
    });
    const resolvedConnections = await this.#resolveConnections(context2, job.options.integrations, body.connections);
    if (!resolvedConnections.ok) {
      return {
        status: "UNRESOLVED_AUTH_ERROR",
        issues: resolvedConnections.issues
      };
    }
    const ioWithConnections = createIOWithIntegrations(io, resolvedConnections.data, job.options.integrations);
    try {
      const parsedPayload = job.trigger.event.parsePayload(body.event.payload ?? {});
      if (!context2.run.isTest) {
        const verified = await job.trigger.verifyPayload(parsedPayload);
        if (!verified.success) {
          return {
            status: "ERROR",
            error: { message: `Payload verification failed. ${verified.reason}` }
          };
        }
      }
      const output = await runLocalStorage.runWith({ io, ctx: context2 }, () => {
        return job.options.run(parsedPayload, ioWithConnections, context2);
      });
      if (this.#options.verbose) {
        this.#logIOStats(io.stats);
      }
      return { status: "SUCCESS", output };
    } catch (error) {
      if (this.#options.verbose) {
        this.#logIOStats(io.stats);
      }
      if (error instanceof ResumeWithParallelTaskError) {
        return {
          status: "RESUME_WITH_PARALLEL_TASK",
          task: error.task,
          childErrors: error.childErrors.map((childError) => {
            return this.#convertErrorToExecutionResponse(childError, body);
          })
        };
      }
      return this.#convertErrorToExecutionResponse(error, body);
    }
  }
  #convertErrorToExecutionResponse(error, body) {
    if (error instanceof AutoYieldExecutionError) {
      return {
        status: "AUTO_YIELD_EXECUTION",
        location: error.location,
        timeRemaining: error.timeRemaining,
        timeElapsed: error.timeElapsed,
        limit: body.runChunkExecutionLimit
      };
    }
    if (error instanceof AutoYieldWithCompletedTaskExecutionError) {
      return {
        status: "AUTO_YIELD_EXECUTION_WITH_COMPLETED_TASK",
        id: error.id,
        properties: error.properties,
        output: error.output,
        data: {
          ...error.data,
          limit: body.runChunkExecutionLimit
        }
      };
    }
    if (error instanceof AutoYieldRateLimitError) {
      return {
        status: "AUTO_YIELD_RATE_LIMIT",
        reset: error.resetAtTimestamp
      };
    }
    if (error instanceof YieldExecutionError) {
      return { status: "YIELD_EXECUTION", key: error.key };
    }
    if (error instanceof ParsedPayloadSchemaError) {
      return { status: "INVALID_PAYLOAD", errors: error.schemaErrors };
    }
    if (error instanceof ResumeWithTaskError) {
      return { status: "RESUME_WITH_TASK", task: error.task };
    }
    if (error instanceof RetryWithTaskError) {
      return {
        status: "RETRY_WITH_TASK",
        task: error.task,
        error: error.cause,
        retryAt: error.retryAt
      };
    }
    if (error instanceof CanceledWithTaskError) {
      return {
        status: "CANCELED",
        task: error.task
      };
    }
    if (error instanceof ErrorWithTask) {
      const errorWithStack2 = ErrorWithStackSchema.safeParse(error.cause.output);
      if (errorWithStack2.success) {
        return {
          status: "ERROR",
          error: errorWithStack2.data,
          task: error.cause
        };
      }
      return {
        status: "ERROR",
        error: { message: JSON.stringify(error.cause.output) },
        task: error.cause
      };
    }
    if (error instanceof RetryWithTaskError) {
      const errorWithStack2 = ErrorWithStackSchema.safeParse(error.cause);
      if (errorWithStack2.success) {
        return {
          status: "ERROR",
          error: errorWithStack2.data,
          task: error.task
        };
      }
      return {
        status: "ERROR",
        error: { message: "Unknown error" },
        task: error.task
      };
    }
    const errorWithStack = ErrorWithStackSchema.safeParse(error);
    if (errorWithStack.success) {
      return { status: "ERROR", error: errorWithStack.data };
    }
    const message = typeof error === "string" ? error : JSON.stringify(error);
    return {
      status: "ERROR",
      error: { name: "Unknown error", message }
    };
  }
  #createRunContext(execution) {
    const { event, organization, project, environment, job, run, source } = execution;
    return {
      event: {
        id: event.id,
        name: event.name,
        context: event.context,
        timestamp: event.timestamp
      },
      organization,
      project: project ?? { id: "unknown", name: "unknown", slug: "unknown" },
      // backwards compat with old servers
      environment,
      job,
      run,
      account: execution.account,
      source
    };
  }
  #createPreprocessRunContext(body) {
    const { event, organization, environment, job, run, account } = body;
    return {
      event: {
        id: event.id,
        name: event.name,
        context: event.context,
        timestamp: event.timestamp
      },
      organization,
      environment,
      job,
      run,
      account
    };
  }
  async #handleHttpSourceRequest(source, sourceRequest) {
    this.#internalLogger.debug("Handling HTTP source request", {
      source
    });
    if (source.dynamicId) {
      const dynamicTrigger = this.#registeredDynamicTriggers[source.dynamicId];
      if (!dynamicTrigger) {
        this.#internalLogger.debug("No dynamic trigger registered for HTTP source", {
          source
        });
        return {
          response: {
            status: 200,
            body: {
              ok: true
            }
          },
          events: []
        };
      }
      const results2 = await dynamicTrigger.source.handle(source, sourceRequest, this.#internalLogger);
      if (!results2) {
        return {
          events: [],
          response: {
            status: 200,
            body: {
              ok: true
            }
          }
        };
      }
      return {
        events: results2.events,
        response: results2.response ?? {
          status: 200,
          body: {
            ok: true
          }
        },
        metadata: results2.metadata
      };
    }
    const handler = this.#registeredHttpSourceHandlers[source.key];
    if (!handler) {
      this.#internalLogger.debug("No handler registered for HTTP source", {
        source
      });
      return {
        response: {
          status: 200,
          body: {
            ok: true
          }
        },
        events: []
      };
    }
    const results = await handler(source, sourceRequest);
    if (!results) {
      return {
        events: [],
        response: {
          status: 200,
          body: {
            ok: true
          }
        }
      };
    }
    return {
      events: results.events,
      response: results.response ?? {
        status: 200,
        body: {
          ok: true
        }
      },
      metadata: results.metadata
    };
  }
  async #handleHttpEndpointRequestForResponse(data, sourceRequest) {
    this.#internalLogger.debug("Handling HTTP Endpoint request for response", {
      data
    });
    const httpEndpoint2 = this.#registeredHttpEndpoints[data.key];
    if (!httpEndpoint2) {
      this.#internalLogger.debug("No handler registered for HTTP Endpoint", {
        data
      });
      return {
        response: {
          status: 200,
          body: {
            ok: true
          }
        }
      };
    }
    const handledResponse = await httpEndpoint2.handleRequest(sourceRequest);
    if (!handledResponse) {
      this.#internalLogger.debug("There's no HTTP Endpoint respondWith.handler()", {
        data
      });
      return {
        response: {
          status: 200,
          body: {
            ok: true
          }
        }
      };
    }
    let body;
    try {
      body = await handledResponse.text();
    } catch (error) {
      this.#internalLogger.error(`Error reading httpEndpoint ${httpEndpoint2.id} respondWith.handler Response`, {
        error
      });
    }
    const response = {
      status: handledResponse.status,
      headers: handledResponse.headers ? Object.fromEntries(handledResponse.headers.entries()) : void 0,
      body
    };
    this.#internalLogger.info(`httpEndpoint ${httpEndpoint2.id} respondWith.handler response`, {
      response
    });
    return {
      response
    };
  }
  async #handleWebhookRequest(request, ctx) {
    this.#internalLogger.debug("Handling webhook request", {
      ctx
    });
    const okResponse = {
      status: 200,
      body: {
        ok: true
      }
    };
    const handlers = this.#registeredWebhookSourceHandlers[ctx.key];
    if (!handlers) {
      this.#internalLogger.debug("No handler registered for webhook", {
        ctx
      });
      return {
        response: okResponse,
        verified: false
      };
    }
    const { verify, generateEvents } = handlers;
    const verifyResult = await verify(request, this, ctx);
    if (!verifyResult.success) {
      return {
        response: okResponse,
        verified: false,
        error: verifyResult.reason
      };
    }
    await generateEvents(request, this, ctx);
    return {
      response: okResponse,
      verified: true
    };
  }
  async #resolveConnections(ctx, integrations, connections) {
    if (!integrations) {
      return { ok: true, data: {} };
    }
    const resolvedAuthResults = await Promise.all(Object.keys(integrations).map(async (key) => {
      const integration = integrations[key];
      const auth = (connections ?? {})[key];
      const result = await this.#resolveConnection(ctx, integration, auth);
      if (result.ok) {
        return {
          ok: true,
          auth: result.auth,
          key
        };
      } else {
        return {
          ok: false,
          error: result.error,
          key
        };
      }
    }));
    const allResolved = resolvedAuthResults.every((result) => result.ok);
    if (allResolved) {
      return {
        ok: true,
        data: resolvedAuthResults.reduce((acc, result) => {
          acc[result.key] = result.auth;
          return acc;
        }, {})
      };
    } else {
      return {
        ok: false,
        issues: resolvedAuthResults.reduce((acc, result) => {
          if (result.ok) {
            return acc;
          }
          const integration = integrations[result.key];
          acc[result.key] = { id: integration.id, error: result.error };
          return acc;
        }, {})
      };
    }
  }
  async #resolveConnection(ctx, integration, auth) {
    if (auth) {
      return { ok: true, auth };
    }
    const authResolver = this.#authResolvers[integration.id];
    if (!authResolver) {
      if (integration.authSource === "HOSTED") {
        return {
          ok: false,
          error: `Something went wrong: Integration ${integration.id} is missing auth credentials from Trigger.dev`
        };
      }
      return {
        ok: true,
        auth: void 0
      };
    }
    try {
      const resolvedAuth = await authResolver(ctx, integration);
      if (!resolvedAuth) {
        return {
          ok: false,
          error: `Auth could not be resolved for ${integration.id}: auth resolver returned null or undefined`
        };
      }
      return {
        ok: true,
        auth: resolvedAuth.type === "apiKey" ? {
          type: "apiKey",
          accessToken: resolvedAuth.token,
          additionalFields: resolvedAuth.additionalFields
        } : {
          type: "oauth2",
          accessToken: resolvedAuth.token,
          additionalFields: resolvedAuth.additionalFields
        }
      };
    } catch (resolverError) {
      if (resolverError instanceof Error) {
        return {
          ok: false,
          error: `Auth could not be resolved for ${integration.id}: auth resolver threw. ${resolverError.name}: ${resolverError.message}`
        };
      } else if (typeof resolverError === "string") {
        return {
          ok: false,
          error: `Auth could not be resolved for ${integration.id}: auth resolver threw an error: ${resolverError}`
        };
      }
      return {
        ok: false,
        error: `Auth could not be resolved for ${integration.id}: auth resolver threw an unknown error: ${JSON.stringify(resolverError)}`
      };
    }
  }
  #buildJobsIndex() {
    return Object.values(this.#registeredJobs).map((job) => this.#buildJobIndex(job));
  }
  #buildJobIndex(job) {
    const internal = job.options.__internal;
    return {
      id: job.id,
      name: job.name,
      version: job.version,
      event: job.trigger.event,
      trigger: job.trigger.toJSON(),
      integrations: this.#buildJobIntegrations(job),
      startPosition: "latest",
      // job is deprecated, leaving job for now to make sure newer clients work with older servers
      enabled: job.enabled,
      preprocessRuns: job.trigger.preprocessRuns,
      internal,
      concurrencyLimit: typeof job.options.concurrencyLimit === "number" ? job.options.concurrencyLimit : typeof job.options.concurrencyLimit === "object" ? { id: job.options.concurrencyLimit.id, limit: job.options.concurrencyLimit.limit } : void 0
    };
  }
  #buildJobIntegrations(job) {
    return Object.keys(job.options.integrations ?? {}).reduce((acc, key) => {
      const integration = job.options.integrations[key];
      acc[key] = this.#buildJobIntegration(integration);
      return acc;
    }, {});
  }
  #buildJobIntegration(integration) {
    const authSource = this.#authResolvers[integration.id] ? "RESOLVER" : integration.authSource;
    return {
      id: integration.id,
      metadata: integration.metadata,
      authSource
    };
  }
  #logIOStats(stats) {
    this.#internalLogger.debug("IO stats", {
      stats
    });
  }
  #standardResponseHeaders(start) {
    return {
      "Trigger-Version": API_VERSIONS.LAZY_LOADED_CACHED_TASKS,
      "Trigger-SDK-Version": VERSION,
      "X-Trigger-Request-Timing": `dur=${performance.now() - start / 1e3}`
    };
  }
  #serializeRunMetadata(job) {
    const metadata = {};
    if (this.#eventEmitter.listenerCount("runSucceeeded") > 0 || typeof job.options.onSuccess === "function") {
      metadata["successSubscription"] = true;
    }
    if (this.#eventEmitter.listenerCount("runFailed") > 0 || typeof job.options.onFailure === "function") {
      metadata["failedSubscription"] = true;
    }
    return JSON.stringify(metadata);
  }
  async #deliverSuccessfulRunNotification(notification) {
    this.#internalLogger.debug("delivering successful run notification", {
      notification
    });
    this.#eventEmitter.emit("runSucceeeded", notification);
    const job = this.#registeredJobs[notification.job.id];
    if (!job) {
      return;
    }
    if (typeof job.options.onSuccess === "function") {
      await job.options.onSuccess(notification);
    }
  }
  async #deliverFailedRunNotification(notification) {
    this.#internalLogger.debug("delivering failed run notification", {
      notification
    });
    this.#eventEmitter.emit("runFailed", notification);
    const job = this.#registeredJobs[notification.job.id];
    if (!job) {
      return;
    }
    if (typeof job.options.onFailure === "function") {
      await job.options.onFailure(notification);
    }
  }
};
function dynamicTriggerRegisterSourceJobId(id) {
  return `register-dynamic-trigger-${id}`;
}
function deepMergeOptions(obj1, obj2) {
  const mergedOptions = { ...obj1 };
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (key in mergedOptions) {
        mergedOptions[key] = [...mergedOptions[key], ...obj2[key]];
      } else {
        mergedOptions[key] = obj2[key];
      }
    }
  }
  return mergedOptions;
}

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/integrations.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/externalSource.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/notifications.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/invokeTrigger.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/triggers/webhook.js
init_esm();

// ../../node_modules/.pnpm/@trigger.dev+sdk@3.3.12_bufferutil@4.0.9_zod@3.24.2/node_modules/@trigger.dev/sdk/dist/esm/security.js
init_esm();

// src/jobs/client.ts
init_esm();
var client = new TriggerClient({
  id: "smb-financial-management-platform",
  apiKey: process.env.TRIGGER_API_KEY || "",
  apiUrl: process.env.TRIGGER_API_URL
});

export {
  z2 as z,
  eventTrigger,
  cronTrigger,
  client
};
//# sourceMappingURL=chunk-MFHHZEYW.mjs.map
