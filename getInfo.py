import re 
import calendar 
import requests,json
import os
import urlparse
def chatBotMessage(message):
    commands =['!! about',"!! help","!! say","!! chatBot","!! smile","!! find","!! rock on","!!"]
    if commands[0] in message:
        return "This room is for authorized potatos only"
    elif commands[1] in message:
        return "!! about -gives description of room !! help -gives all commands of the room !! say <something> -makes me say <something> !! chatBot <something> -say something to chatterbot !! smile -to make the bot a little happier !! find <zipcode> find concerts in the zipcode area !! rock on makes bot rock"
    elif commands[2] in message:
        print message[7:] 
        return message[7:]
    elif commands[3] in message:
        return message
    elif commands[4] in message:
        return "=]"
    elif commands [5] in message:
        return message
    elif commands [6] in message:
        return "\m/  (  -_-   )  \m/"
    elif commands [7] in message[:2]:
        return "Sorry I didn't get that"

def isUrl(url):
    parts = urlparse.urlsplit(url)
    if not parts.scheme or not parts.netloc: 
     return False
    else:
     return True

def isImage(imgUrl):
    image=False
    endings=[".png", ".jpg", ".jpeg",".gif"]
    for end in endings:
        if end in imgUrl:
            image=True
    return image
    
def getEvents(zipCode):
    events=[]
    local_events=[]
    print zipCode
    local_events=[]
    if len(zipCode)==5 and zipCode.isdigit():
        local_events=requests.get("https://api.seatgeek.com/2/events?client_id="+os.getenv("client_id")+"&postal_code="+zipCode+"&range=20mi&sort=datetime_local.asc&taxonomies.name=concert&page=1&per_page=5")
    else:
        return "No events in this area"
    print json.dumps(local_events.json(),indent=2)
        
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