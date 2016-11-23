//index
$(document).ready(function() {
    $('#addEventoForm').submit(function(e) {
        e.preventDefault();
    });
    $('#editEventoForm').submit(function(e) {
        e.preventDefault();
    })
});

//Firebase
var eventActions = firebase.database().ref('events');

eventActions.on('child_added', function(data) {
    recuperaDados();
});
eventActions.on('child_changed', function(data) {
    recuperaDados();
});
eventActions.on('child_removed', function(data) {
    recuperaDados();
});

function salvarDados() {
    var form = {};
    $("#addEventoForm").serializeArray().map(function(x) {
        form[x.name] = x.value;
    });

    firebase.database().ref('events').push({
        allDay: 'true',
        setor: form.setor,
        funcionarios: form.funcionarios,
        start: form.data
    });

    $("#resetFormAdd").click();
    $("#closeFormAdd").click();
};

function atualizarDados(event = null) {
    if (event != null)
    {
      firebase.database().ref('events/' + event.id).update({
          allDay: 'true',
          setor: event.title.split(': ')[0],
          funcionarios: event.title.split(': ')[1],
          start: event.start.format()
      });
      return false;
    }
    var form = {};
    $("#editEventoForm").serializeArray().map(function(x) {
        form[x.name] = x.value;
    });

    firebase.database().ref('events/' + form.key).update({
        allDay: 'true',
        setor: form.setor,
        funcionarios: form.funcionarios,
        start: form.data
    });

    $("#resetFormEdit").click();
    $("#closeFormEdit").click();
};

function excluirDados() {
    var form = {};
    $("#editEventoForm").serializeArray().map(function(x) {
        form[x.name] = x.value;
    });

    firebase.database().ref('events/' + form.key).remove();

    $("#resetFormEdit").click();
    $("#closeFormEdit").click();
};

function recuperaDados() {
    var events = new Array();
    firebase.database().ref('/events').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var evento = childSnapshot.val();
            events.push({
                id: childSnapshot.key,
                title: evento.setor + ': ' + evento.funcionarios,
                start: evento.start
            });
        });
    }).then(function() {
        $("#calendar").fullCalendar('removeEventSources');
        $("#calendar").fullCalendar('addEventSource', events);
    });
}

//fullCalendar

$(document).ready(function() {
    moment.locale('pt-br');
    $('#calendar').fullCalendar({
        height: 'auto',
        customButtons: {
            novoEvento: {
                text: "Nova Entrada",
                click: function() {
                    $('#addModal').modal('show');
                }
            }
        },
        header: {
            left: 'title,',
            center: 'novoEvento',
            right: 'month,today,prev,next,listMonth,listYear'
        },
        locale: 'pt-br',
        buttonText: {
            today: 'Mês Atual',
            year: 'Ano',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        allDayText: 'O dia todo',
        view: {
            name: 'listMonth'
        },
        editable:true,
        // eventStartEditable:false,
        eventDurationEditable:false,
        // defaultView: 'listMonth',
        // hiddenDays: [0, 1, 2, 3, 4, 5],
        eventClick: function(calEvent, jsEvent, view) {
            var form = $('#editModal');
            form.find('input[name="key"]').attr('value', calEvent.id);
            form.find('input[name="setor"]').attr('value', calEvent.title.split(': ')[0]);
            form.find('textarea[name="funcionarios"]').val(calEvent.title.split(': ')[1]);
            form.find('input[name="data"]').attr('value', calEvent.start.format());
            form.modal('show');
        },
        eventMouseover: function(event, jsEvent, view) {
            document.getElementById('calendar').style.cursor = 'pointer'
        },
        eventMouseout: function(event, jsEvent, view) {
            document.getElementById('calendar').style.cursor = 'auto'
        },
        eventDrop: function( event, jsEvent, ui, view ) {
            atualizarDados(event);
        }
    });
});

recuperaDados();
