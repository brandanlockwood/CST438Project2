import re 
import calendar 
import requests,json
import os
def isImage(imgUrl):
    image=False
    endings=[".png", ".jpg", ".jpeg",".gif"]
    for end in endings:
        if end in imgUrl:
            image=True
    return image
    
def getEvents():
    events=[]
    local_events=requests.get("https://api.seatgeek.com/2/events?client_id="+os.getenv("client_id")+"&postal_code=93933&range=10mi&sort=datetime_local.asc&taxonomies.name=concert&page=1&per_page=5")
    local_events=local_events.json()
    
    if len(local_events["events"]) == 0:
        return "No events in this area"
    else :
        for i in local_events["events"]:
            #events.append({"Time":i["datetime_local"],""})
            # "Time :"+i["datetime_local"]
            time=i["datetime_local"]
            date=re.split("-|T|:",time)
            month =calendar.month_name[int(date[1])]
            year = date[0]
            day =date[2]
            hours = int(date[3])
            minutes =date[4]
            setting = "AM"
            if hours > 12:
                setting = "PM"
                hours -= 12
            time=str(hours) +":"+minutes+" "+setting
            date=month+" "+str(day)+","+year
            print i["performers"][0]["image"]
            #print json.dumps(i["performers"],indent=2)
            print "Title: "+i["title"]
            print "URL: "+i["url"]
            print "Venue: "+i["venue"]["name"]
            location =i["venue"]["city"]+","+i["venue"]["state"]+", "+i["venue"]["address"]
            events.append({"time":time,"date":date,"tickets":i["url"],"imageURL":i["performers"][0]["image"],"venue":i["venue"]["name"],"location":location,"title":i['title']})
        return events
            #print json.dumps(i["venue"],indent=2)
            #print json.dumps(i["performers"],indent=2)
            #print json.dumps(local_events, indent=2)
def getMonth(string):
    string =string.lower()
    months= {
        "january":1,
        "february":2,
        "march":3,
        "april":4,
        "may":5,
        "june":6,
        "july":7,
        "august":8,
        "september":9,
        "october":10,
        "november":11,
        "december":12
    }
    return months.get(string, -1)