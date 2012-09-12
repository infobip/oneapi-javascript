// -- decorations --------------------------------------------------------------
FM.DmObject.defineClassDecorations('SignupData',{
        username:  'Username',
        forename:  'First name',
        surname:  'Last name',
        gsm:  'Telephone (GSM)',
        telephone:  'Telephone',
        email:  'Email address',
        password:  'Password',
        password2:  'Repeat password',
        data: 'Data'
});


FM.DmObject.defineClassDecorations('CustomerProfile',{
        id:  'Id',
        username:  'Username',
        forename:  'First name',
        surname:  'Last name',
        
        countryId:  'Country',
        city: 'City',
        street:  'Street',
        zipCode:  'Zip code',

        fax:  'Fax',        
        gsm:  'Telephone (GSM)',
        telephone:  'Telephone',

        email:  'Email address',
        msn:  'MSN id',
        skype:  'Skype id',
        
        primaryLanguageId:  'Language',
        secondaryLanguageId:  'Secondary language',
        timezoneId:  'Timezone',
                
        enabled:  'Enabled',
        data: 'Data'
});

