<!ELEMENT alert (summary, details, locations, sectors, duration, detail_sections)>
<!ATTLIST alert
start CDATA #REQUIRED
end CDATA #IMPLIED
type (ElevatedThreat | Imminent Threat)
link CDATA #REQUIRED
>

<!ELEMENT summary (#PCDATA)>
<!ELEMENT details ANY>
<!ELEMENT duration (#PCDATA)>
<!ELEMENT locations (location*)>
<!ELEMENT location (#PCDATA)>
<!ELEMENT sectors (sector*)>
<!ELEMENT sector (#PCDATA)>
<!ELEMENT detail_sections (detail_section*)>
<!ELEMENT detail_section (detail_title,detail)>
<!ELEMENT detail_title (#PCDATA)>
<!ELEMENT detail (#PCDATA)>

Sample Alerts (alerts) file

<?xml version="1.0" encoding="UTF-8"?>
<alerts>
<alert start='2013/04/14 14:39' end='2014/04/14 14:38' href='https://www.dhs.gov/ntas/samplealert.xml' />
</alerts>
Description of elements
alert
A single active alert. Contains the following attributes
start
The effective start date/time of the alert, in the form YYYY/MM/DD HH:MM, expressed in GMT
end
The effective end date/time of the alert, in the form YYYY/MM/DD HH:MM, expressed in GMT
type
The type of the alert. Possible choices are
Imminent Threat
Elevated Threat
link
a URL to a PDF document which provides further details about the alert
summary
A short plain text summary of the alert.
details
A longer explanation of the alert. May contain HTML
sectors
A possibly empty list of sectors which are impacted by this alert
sector
An individual sector impacted by an alert. Represented as plain text
locations
A possibly empty list of locations which are impacted by this alert
location
An individual location impacted by an alert. Represented as plain text
duration
A plain text description of the expected duration of this alert May be blank
detail_sections
A list of information specific to the threat detailed by the alert
detail section
An individual detail section containing a specific piece of information for the alert.
detail_title
An individual detail section title. May contain HTML
detail
An individual piece of detail related to the threat. May contain HTML
Sample individual alert
<?xml version="1.0" encoding="UTF-8"?>
<alert start="2011/04/14 14:39" end="2012/04/14 14:38" type="Elevated Threat" link="https://www.dhs.gov/sites/default/files/publications/15_1214_ntas_sample_elevated_alert.pdf">
<summary><![CDATA[This is a summary of the alert]]></summary>
<details><![CDATA[<p>This is a more detailed description of the alert</p>]]></details>
<locations>
<location><![CDATA[A location or region]]></location>
<location><![CDATA[Another location or region]]></location>
</locations>
<sectors>
<sector><![CDATA[An impacted sector]]></sector>
<sector><![CDATA[Another impacted sector]]></sector>
</sectors>
<duration><![CDATA[Freeform text description of the duration of the alert]]></duration>
<detail_sections>
<detail_section>
<detail_title><![CDATA[Freeform detail title]]></detail_title>
<detail><![CDATA[<p>Freeform text description of threat details</p>]]></detail>
</detail_section>
<detail_section>
<detail_title><![CDATA[Freeform detail title]]></detail_title>
<detail><![CDATA[<p>Freeform text description of threat details</p>]]></detail>
</detail_section>
<detail_section>
<detail_title><![CDATA[Freeform detail title]]></detail_title>
<detail><![CDATA[<p>Freeform text description of threat details</p>]]></detail>
</detail_section>
<detail_section>
<detail_title><![CDATA[Freeform detail title]]></detail_title>
<detail><![CDATA[<p>Freeform text description of threat details</p>]]></detail>
</detail_section>
</detail_sections>
</alert>

