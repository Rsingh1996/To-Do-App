
    exports.getDate = function (){

    const today = new Date();

    const option = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }

    return (today.toLocaleDateString("en-IN", option));
}

exports.getDay = function (){

    const today = new Date();

    const option = {
        weekday: 'long',
    }

    return (today.toLocaleDateString("en-IN", option));
    
}