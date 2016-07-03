Date.DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
Date.MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
Date.DAYS_PER_MONTH = [31,29,31,30,31,30,31,31,30,31,30,31];   
Date.MILLI_SECS_PER_HOUR = 3600000; // 60*60*1000

Date.prototype.daysPerMonth = function()
{
    var k = this.getMonth();    
    
    if (k == 1 && this.isLeapYear())
        return 29;
    
    return Date.DAYS_PER_MONTH[k];
}
        
Date.prototype.isLeapYear = function() {
    return new Date(this.getFullYear(), 1, 29).getMonth() == 1;
}
        
Date.prototype.addHours = function(h) {
    return new Date(this.getTime() + h*Date.MILLI_SECS_PER_HOUR);
}        
	
Date.prototype.addDays = function(days) {
    return new Date(this.getTime() + days*24*Date.MILLI_SECS_PER_HOUR);
}
	
Date.prototype.addWeeks =  function(weeks) {
    return new Date(this.getTime() + weeks*7*24*Date.MILLI_SECS_PER_HOUR);
}

Date.prototype.addMonths = function(months) {
    var d = new Date(this);
    d.setMonth(this.getMonth() + months);	
    return d;
}

Date.prototype.addYears =  function(years) {
    var d = new Date(this);
    d.setYear(this.getFullYear() + years);
    return d;	
}

Date.prototype.between = function(a, b)
{
    return (this >= a && this <= b)
}

Date.prototype.overlap = function(a, b, c, d)
{       
    // assumes a > b and c > d
    
    if (a.between(c,d) || b.between(c,d) || c.between(a,b) || d.between(a,b))
        return true;

    return false;
}

Date.prototype.MySQLDateTojsDate = function(mysql_string)
{ 
    //function parses mysql datetime string and returns javascript Date object
    //input has to be in this format: 2007-06-05 15:26:02
    var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    var parts=mysql_string.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
	
    return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);

}

Date.prototype.toMySQLDate = function()
{				
    return this.getFullYear() + "-" + (this.getMonth()+1) + "-" + this.getDate() + " " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
}

Date.prototype.getMonthName = function()
{	
    return Date.MONTHS[this.getMonth()];
}

Date.prototype.getDayName = function()
{	
    return Date.DAYS[this.getDay()];
}

/*
Date.prototype.toEventDate = function()
{				
    return this.getDate() + " " + this.getMonthName() + " " + this.getFullYear();
}
*/

Date.prototype.format = function(mask)
{
    //return $.datepicker({ dateFormat: mask }).val();
    
    // currentlu using jqueryui datepicker
    
    return $.datepicker.formatDate(mask, this);
    
    //return this.getDate() + " " + this.getMonthName() + " " + this.getFullYear();
}

Date.prototype.UTCSeconds = function () {

    //return Math.floor(new Date(
    //                            this.getUTCFullYear(),
    //                            this.getUTCMonth(),
    //                            this.getUTCDate(),
    //                            this.getUTCHours(),
    //                            this.getUTCMinutes(),
    //                            this.getUTCSeconds()
    //                            ).getTime() / 1000);

    var UTCseconds = (x.getTime() + x.getTimezoneOffset() * 60 * 1000) / 1000;
}
