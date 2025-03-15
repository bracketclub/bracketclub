module.exports={"bracket":{"regions":{"S":{"name":"South","fullname":"South Region","sameSideAs":"E","teams":["Florida","Kansas","Syracuse","UCLA","VCU","Ohio St","New Mexico","Colorado","Pittsburgh","Stanford","Dayton","Stephen F Austin","Tulsa","Western Michigan","Eastern Kentucky","Albany"],"id":"S"},"E":{"name":"East","fullname":"East Region","sameSideAs":"S","teams":["Virginia","Villanova","Iowa State","Michigan St","Cincinnati","North Carolina","UConn","Memphis","George Washington","Saint Joseph's","Providence","Harvard","Delaware","NC Central","Milwaukee","Coastal Carolina"],"id":"E"},"W":{"name":"West","fullname":"West Region","sameSideAs":"MW","teams":["Arizona","Wisconsin","Creighton","San Diego St","Oklahoma","Baylor","Oregon","Gonzaga","Oklahoma St","BYU","Nebraska","North Dakota St","New Mexico St","UL Lafayette","American","Weber St"],"id":"W"},"MW":{"name":"Midwest","fullname":"Midwest Region","sameSideAs":"W","teams":["Wichita St","Michigan","Duke","Louisville","Saint Louis","UMass","Texas","Kentucky","Kansas St","Arizona St","Tennessee","NC State","Manhattan","Mercer","Wofford","Cal Poly"],"id":"MW"},"FF":{"id":"FF","name":"Final Four","championshipName":"National Championship"}}},"constants":{"BEST_OF":1,"REGION_COUNT":4,"REGION_IDS":["S","E","W","MW"],"FINAL_ID":"FF","ALL_IDS":["S","E","W","MW","FF"],"EMPTY":"SXXXXXXXXXXXXXXXEXXXXXXXXXXXXXXXWXXXXXXXXXXXXXXXMWXXXXXXXXXXXXXXXFFXXX","FINAL_NAME":"Final Four","FINAL_FULLNAME":"Final Four","FINAL_CHAMPIONSHIP_NAME":"National Championship","UNPICKED_MATCH":"X","TEAMS_PER_REGION":16},"regex":/([SEWMW]{1,2})([\dX]{15,30})([SEWMW]{1,2})([\dX]{15,30})([SEWMW]{1,2})([\dX]{15,30})([SEWMW]{1,2})([\dX]{15,30})(FF)([SEWMWX]{3,6})/,"order":[1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15],"scoring":{"standard":[10,20,40,80,160,320],"gooley":[[1,1,1.2,1.3,1.4,1.5,1.6,2,2,2.6,3,3.4,4.3,7.5,22.5,147],[1.3,1.4,1.7,2.2,2.7,3.8,5.2,7.8,8.3,9.8,10.1,11.1,12.2,22.5,69.2,461.3],[1.8,2.3,3.2,5.3,7,9.8,12.8,19.7,22.1,29.8,36.1,58.3,80.2,137.9,379.9,2717.9],[2.9,4.2,6.8,11.3,16.9,26.1,37.1,57.8,70,107.6,147.7,242,398.7,967.4,3420.4,29443.8],[4.8,7.9,14.3,26.7,44.1,73.6,112.2,185.9,240.6,402.3,619.8,1190.6,2424.5,7683.7,37241.9,454365.7],[8.4,15.6,31.8,66.5,121.1,218.8,356,626.4,867.4,1586.3,2775.9,6386.8,16616.3,72080.4,508899.8,9458997.7]]},"locks":"2014-03-20T16:15:00.000Z","complete":"2014-04-08T05:30:00.000Z"};