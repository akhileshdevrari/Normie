var fd_num = 1;
var attributes = new Array();
var fd_lhs = new Array();
var fd_rhs = new Array();
var original_fd_lhs = new Array();
var original_fd_rhs = new Array();
var minimal_cover_num = 0;
var candidate_keys_num = 0;
var normalize_to_3nf_num = 0;
var check_normal_form_num = 0;
var candidate_keys = new Array();
var in_2nf, in_3nf, in_bcnf;
var three_nf = new Array();

window.addEventListener("load", initialize);

function initialize()
{
	attributes = new Array();
	fd_lhs = new Array();
	fd_rhs = new Array();
	original_fd_lhs = new Array();
	original_fd_rhs = new Array();
	candidate_keys = new Array();
	three_nf = new Array();
	if(minimal_cover_num%2 == 1)
		main_minimal_cover();
	minimal_cover_num = 0;
	if(candidate_keys_num%2 == 1)
		main_candidate_keys();
	candidate_keys_num = 0;
	if(check_normal_form_num%2 == 1)
		main_check_normal_form();
	check_normal_form_num = 0;
	if(normalize_to_3nf_num%2 == 1)
		main_normalize_to_3nf();
	normalize_to_3nf_num = 0;
	document.getElementById('attributes_in').value = "";
	for(var i=1; i<fd_num; i++)
		delete_fd(i);
	fd_num = 1;
	fd_input();
}

function lexer() 
{
	attributes = new Array();
	fd_lhs = new Array();
	fd_rhs = new Array();
	var string = document.getElementById('attributes_in').value;
	var i = 0;
	while(i < string.length)
	{
		var j = i;
		var temp = "";
		while(string[j]!=' ' && string[j]!=',' && j<string.length)
		{
			temp += string[j];
			j++;
		}
		attributes.push(temp);
		while(string[j] == ' ' || string[j]==',' && j<string.length)
			j++;
		i = j;
	}

	for(var k=1; k<fd_num; k++)
	{
		if(document.getElementById("lhs"+k) == null)
			continue;
		var arr = new Array();
		i = 0;
		var string = document.getElementById("lhs"+k).value;
		while(i < string.length)
		{
			var j = i;
			var temp = "";
			while(string[j]!=' ' && string[j]!=',' && j<string.length)
			{
				temp += string[j];
				j++;
			}
			arr.push(temp);
			while(string[j] == ' ' || string[j]==',' && j<string.length)
				j++;
			i = j;
		}
		arr.sort();
		fd_lhs.push(arr);
	}

	for(var k=1; k<fd_num; k++)
	{
		if(document.getElementById("lhs"+k) == null)
			continue;
		var arr = new Array();
		i = 0;
		var string = document.getElementById("rhs"+k).value;
		while(i < string.length)
		{
			var j = i;
			var temp = "";
			while(string[j]!=' ' && string[j]!=',' && j<string.length)
			{
				temp += string[j];
				j++;
			}
			arr.push(temp);
			while(string[j] == ' ' || string[j]==',' && j<string.length)
				j++;
			i = j;
		}
		arr.sort();
		fd_rhs.push(arr);
	}

	for(var i=0; i<fd_lhs.length; i++)
		original_fd_lhs[i] = fd_lhs[i].slice();
	for(var i=0; i<fd_rhs.length; i++)
		original_fd_rhs[i] = fd_rhs[i].slice();
}

function fd_input()
{
	var new_fd = "<span id = \"fd"+fd_num+"\">";
	new_fd += "<input type=\"text\" id=\"lhs"+fd_num+"\"> <span class=\"fd_arrow\">-></span> <input type=\"text\" id=\"rhs"+fd_num+"\">";
	new_fd += " <button type=\"button\" onclick=\"delete_fd("+fd_num+")\">Delete</button><br>";
	new_fd += "</span>"
	var container = document.createElement("div");
	container.innerHTML = new_fd;
	document.getElementById('input_form').appendChild(container);
	fd_num++;
}

function delete_fd(num)
{
	document.getElementById("fd"+num).remove();
}

function error()
{
	console.log("Apna Error\n");
}

function find_minimal_cover()
{
	// Start with filling attributes[], fd_lhs[] and fd_rhs[] with initial data
	lexer();

	//remove trivial FDs
	for(var i = 0; i<fd_rhs.length; i++)
	{
		for(var j=0; j<fd_rhs[i].length; j++)
		{
			//checking for fd_rhs[i][j]
			for(var k=0; k<fd_lhs[i].length; k++)
			{
				if(fd_lhs[i][k] == fd_rhs[i][j])
				{
					fd_rhs[i].splice(j, 1);
					j--;
					break;
				}
			}
		}
	}

	//Minimize LHS of each FD
	//Check each attribute in fd_lhs, if it's present in fd_rhs and its fd_lhs counterpart there has it's fd_lhs collegues here, remove it
	for(var i=0; i<fd_lhs.length; i++)
	{
		for(var j=0; j<fd_lhs[i].length; j++)
		{
			//checking for fd_lhs[i][j]
			for(var k=0; k<fd_rhs.length; k++)
			{
				if(fd_lhs[k].length == fd_lhs[i].length-1)
				{
					var l;
					for(l=0; l<fd_rhs[k].length; l++)
					{
						if(fd_lhs[i][j] == fd_rhs[k][l])
							break;
					}
					if(l != fd_rhs[k].length)
					{
						//Now check if other attributes of fd_lhs[i] are present in fd_lhs[k]
						var sum = 0;
						for(var m = 0; m<fd_lhs[i].length; m++)
						{
							for(var n=0; n<fd_lhs[k].length; n++)
							{
								if(fd_lhs[i][m] == fd_lhs[k][n])
									sum++;
							}
						}
						if(sum == fd_lhs[i].length-1)
						{
							fd_lhs[i].splice(j, 1);
							j--;
							break;
						}
					}
				}
			}
		}
	}


	//Minimize LHS. If for some attribute in RHS, l1 and l2 are two LHS..... if l1 is subset of l2, delete l1
	for(var i=0; i<fd_rhs.length; i++)
	{
		for(var j=0; j<fd_rhs[i].length; j++)
		{
			//check if fd_rhs[i][j] repeats itself
			var flag = true;
			for(var k=i+1; k<fd_rhs.length && flag; k++)
			{
				for(var l=0; l<fd_rhs[k].length; l++)
				{
					if(fd_rhs[i][j] == fd_rhs[k][l])
					{
						//if lhs[k] is subset of lhs[i] then delete rhs[i][j]  and vice versa
						var sum = 0;
						for(var m=0; m<fd_lhs[i].length; m++)
						{
							for(var n = 0; n<fd_lhs[k].length; n++)
							{
								if(fd_lhs[i][m] == fd_lhs[k][n])
									sum++;
							}
						}
						// console.log("two:  i = "+i+"  j = "+j+"  k = "+k+"  l = "+l+"  sum = "+sum+"\n");
						if(sum == fd_lhs[k].length)
						{
							//delete fd_lhs[i][j]
							fd_rhs[i].splice(j, 1);
							flag = false;
							break;
						}
						else if(sum == fd_lhs[i].length)
						{
							//delete fd_lhs[k][l]
							fd_rhs[k].splice(l, 1);
							break;
						}
					}
				}
			}
			if(flag == false)
				j--;
		}
	}

	//Remove duplicate entries i.e if two FDs are identical, remove one
	for(var i=0; i<fd_lhs.length; i++)
	{
		for(var j=i+1; j<fd_lhs.length; j++)
		{
			//if each element in lhs[i] == lhs[j] and each element in rhs[i] == rhs[j]
			var flag = true; // if flag remains true, we will delete  fd_lhs[j]
			//Note that lhs[i] and lhs[j] are already sorted
			if(fd_lhs[i].length != fd_lhs[j].length)
				flag = false;
			for(var m = 0; m<fd_lhs[i].length && m<fd_lhs[j].length; m++)
			{
				if(fd_lhs[i][m] != fd_lhs[j][m])
					flag = false;
			}
			if(fd_rhs[i].length != fd_rhs[j].length)
				flag = false;
			for(var m = 0; m<fd_rhs[i].length && m<fd_rhs[j].length; m++)
			{
				if(fd_rhs[i][m] != fd_rhs[j][m])
					flag = false;
			}
			if(flag)
			{
				fd_lhs.splice(j, 1);
				fd_rhs.splice(j, 1);
				j--;
			}
		}
	}

	//Remove redundant FDs (those that are implied by others)
	//One by one try check if Closure of entire LHS remains same on removing a FD, remove that FD
	for(var i=0; i<fd_lhs.length; i++)
	{
		for(var m=0; m<fd_rhs[i].length; m++)
		{
			var temp_fd_lhs = [];
			var temp_fd_rhs = [];
			for(var j=0; j<fd_lhs.length; j++)
				temp_fd_lhs[j] = fd_lhs[j].slice();
			for(var j=0; j<fd_rhs.length; j++)
				temp_fd_rhs[j] = fd_rhs[j].slice();
			temp_fd_rhs[i].splice(m, 1);
			// if closure of fd_lhs[i] contains fd_rhs[i], remove fd_lhs[i]
			var closure = find_closure(fd_lhs[i], temp_fd_lhs, temp_fd_rhs);

			var j;
			for(j=0; j<fd_rhs[i].length; j++)
			{
				var k;
				for(k=0; k<closure.length; k++)
				{
					if(closure[k] == fd_rhs[i][j])
						break;
				}
				if(k == closure.length)
					break;
			}
			if(j == fd_rhs[i].length)	// All elements in fd_rhs[i] are present in closure
			{
				fd_rhs[i].splice(m, 1);
				m--;
			}
		}
	}

	//For each attribute in some LHS, check if it is present in closure of other attributes, if yes, delete it
	for(var i=0; i<fd_lhs.length; i++)
	{
		for(var j=0; j<fd_lhs[i].length; j++)
		{
			var temp_arr = fd_lhs[i].slice();
			var att = fd_lhs[i][j];
			temp_arr.splice(j, 1);
			var closure = find_closure(temp_arr, fd_lhs, fd_rhs);
			for(var k=0; k<closure.length; k++)
			{
				if(closure[k] == att)
				{
					fd_lhs[i].splice(j, 1);
					j--;
					break;
				}
			}
		}
	}
}

function find_closure(lhs, temp_fd_lhs, temp_fd_rhs)
{
	var closure = lhs.slice();
	var new_rhs_coming = true;
	while(new_rhs_coming)
	{
		new_rhs_coming = false;
		for(var i=0; i<temp_fd_lhs.length; i++)
		{
			var lhs_in_closure = true;
			for(var j=0; j<temp_fd_lhs[i].length; j++)
			{
				var lhs_ij_in_closure = false;
				for(var k=0; k<closure.length; k++)
				{
					if(closure[k] == temp_fd_lhs[i][j])
					{
						lhs_ij_in_closure = true;
						break;
					}
				}
				if(lhs_ij_in_closure == false)
				{
					lhs_in_closure = false;
					break;
				}
			}
			if(lhs_in_closure)
			{
				for(var j=0; j<temp_fd_rhs[i].length; j++)
				{
					//if fd_rhs[i][j]  is not in closure, add it to closure and mark new_rhs_coming as true
					var rhs_ij_in_closure = false;
					for(var k=0; k<closure.length; k++)
					{
						if(closure[k] == temp_fd_rhs[i][j])
						{
							rhs_ij_in_closure = true;
							break;
						}
					}
					if(rhs_ij_in_closure == false)
					{
						new_rhs_coming = true;
						closure.push(temp_fd_rhs[i][j]);
					}
				}
			}
		}
	}
	closure.sort();
	return closure;
}

function print_minimal_cover()
{
	var field = "<fieldset>";
	field += "<ul style=\"list-style-type:none\">";
	for(var i=0; i<fd_lhs.length; i++)
	{
		for(var j=0; j<fd_rhs[i].length; j++)
		{
			field += "<li>"
			for(var k=0; k<fd_lhs[i].length; k++)
				field += fd_lhs[i][k]+" ";
			field += "  ->  "+fd_rhs[i][j];
			field += "</li>";
		}
	}
	field += "</ul>"
	field += "</fieldset><br>";
	document.getElementById("minimal_cover_field").innerHTML = field;
}


function main_minimal_cover()
{
	if(minimal_cover_num % 2 == 0)
	{
		find_minimal_cover();
		print_minimal_cover();
	}
	else
	{
		document.getElementById("minimal_cover_field").innerHTML = "";
	}
	minimal_cover_num++;
}

function find_candidate_keys()
{
	//Reset candidate_keys[]
	candidate_keys = new Array();

	var not_on_rhs = new Array();	//Every candidate key will have these attributes
											//potential_key_store =  R-OnRHSNotOnLHS-ClosureSet(NotOnRHS)
	var potential_key_store = new Array();	//Apart from attributes of not_on_rhs and candidate keys contains attributes from this set
	var closure_not_on_rhs = new Array();	//Closure of not_on_rhs set
	for(var i=0; i<attributes.length; i++)
	{
		var in_rhs = false;
		for(var j=0; j<fd_rhs.length && in_rhs==false; j++)
		{
			for(var k=0; k<fd_rhs[j].length && in_rhs==false; k++)
			{
				if(fd_rhs[j][k] == attributes[i])
					in_rhs = true;
			}
		}
		if(in_rhs == false)
			not_on_rhs.push(attributes[i]);
	}

	closure_not_on_rhs = find_closure(not_on_rhs, fd_lhs, fd_rhs);

	potential_key_store = attributes.slice();
	// Remove attribues from potential_key_store which are present in closure_not_on_rhs
	for(var i=0; i<potential_key_store.length; i++)
	{
		var j;
		for(j=0; j<closure_not_on_rhs.length; j++)
		{
			if(closure_not_on_rhs[j] == potential_key_store[i])
				break;
		}
		if(j != closure_not_on_rhs.length)
		{
			potential_key_store.splice(i, 1);
			i--;
		}
	}
	// Remove attribues from potential_key_store which are present in rhs but not in lhs
	for(var i=0; i<potential_key_store.length; i++)
	{
		var in_lhs = false;
		var in_rhs = false;
		for(var j=0; j<fd_lhs.length && in_lhs==false; j++)
		{
			for(var k=0; k<fd_lhs[j].length && in_lhs==false; k++)
			{
				if(fd_lhs[j][k] == potential_key_store[i])
					in_lhs = true;
			}
		}
		for(var j=0; j<fd_rhs.length && in_rhs==false; j++)
		{
			for(var k=0; k<fd_rhs[j].length && in_rhs==false; k++)
			{
				if(fd_rhs[j][k] == potential_key_store[i])
					in_rhs = true;
			}
		}
		if(in_rhs==true && in_lhs==false)
		{
			potential_key_store.splice(i, 1);
			i--;
		}
	}

	var closure = find_closure(not_on_rhs, fd_lhs, fd_rhs);
	if(closure.length == attributes.length)		//not_on_rhs is the only candidate key
		candidate_keys.push(not_on_rhs);
	else 		//make candidate keys from not_on_rhs and potential_key_store set
		make_candidate_keys(potential_key_store, not_on_rhs, not_on_rhs);

	//Now we have all candidate keys, just sort them and remove empty candidate keys
	for(var i=0; i<candidate_keys.length; i++)
	{
		if(candidate_keys[i].length == 0)
		{
			candidate_keys.splice(i, 1);
			i--;
			continue;
		}
		candidate_keys[i].sort();
	}
	//Remove duplicates from candidate_keys[]
	for(var i=0; i<candidate_keys.length; i++)
	{
		for(var j=i+1; j<candidate_keys.length; j++)
		{
			var k=0;
			for(k=0; k<candidate_keys[i].length && k<candidate_keys[j].length; k++)
			{
				if(candidate_keys[i][k] != candidate_keys[j][k])
					break;
			}
			if(candidate_keys[i].length == candidate_keys[j].length && k==candidate_keys[i].length)
			{
				candidate_keys.splice(j, 1);
				j--;
			}
		}
	}
}

function make_candidate_keys(potential_key_store, key, not_on_rhs)
{
	for(var i=0; i<potential_key_store.length; i++)
	{
		var temp_key = key.slice();
		temp_key.push(potential_key_store[i]);
		var closure = find_closure(temp_key, fd_lhs, fd_rhs);
		if(closure.length == attributes.length)	//check if key becomes a superkey
		{
			// console.log("kuchh");
			var is_candidate = true;
			//check if key is indeed a candidate key
			for(var j=0; j<temp_key.length; j++)
			{
				var in_notrhs = false;
				for(var k=0; k<not_on_rhs.length && in_notrhs==false; k++)
				{
					if(not_on_rhs[k] == temp_key[j])
						in_notrhs = true;
				}
				if(in_notrhs==false && temp_key[j]!=potential_key_store[i])
				{
					var temp_arr = temp_key.slice();
					temp_arr.splice(j, 1);
					var temp_closure = find_closure(temp_arr, fd_lhs, fd_rhs);
					if(temp_closure.length == attributes.length)
					{
						is_candidate = false;
						break;
					}
				}
			}
			if(is_candidate)
			{
				candidate_keys.push(temp_key);
			}
		}
		else
		{
			var new_key_store = potential_key_store.slice();
			new_key_store.splice(i, 1);
			make_candidate_keys(new_key_store, temp_key, not_on_rhs);
		}
	}
}

function main_candidate_keys()
{
	if(candidate_keys_num % 2 == 0)
	{
		find_minimal_cover();
		find_candidate_keys();
		print_candidate_keys();
	}
	else
	{
		document.getElementById("candidate_keys_field").innerHTML = "";
	}
	candidate_keys_num++;
}

function print_candidate_keys()
{
	var field = "<fieldset>";
	field += "<ul style=\"list-style-type:disc\">";
	for(var i=0; i<candidate_keys.length; i++)
	{
		field += "<li>"
		for(var j=0; j<candidate_keys[i].length; j++)
			field += candidate_keys[i][j]+" ";
		field += "</li>";
	}
	field += "</ul>"
	field += "</fieldset><br>";
	document.getElementById("candidate_keys_field").innerHTML = field;
}

function find_normal_form()
{
	in_2nf = in_3nf = in_bcnf = true;
	find_minimal_cover();
	find_candidate_keys();

	//Checking for 2NF
	// If LHS of any non-trivial FD is proper subset of any candidate key, then the table cannot be in 2NF
	for(var i=0; i<original_fd_lhs.length; i++)
	{
		var lhs_in_candidate_key = false;
		var j=0;
		for(j=0; j<candidate_keys.length; j++)
		{
			if(candidate_keys[j].length <= original_fd_lhs[i].length)
				continue;
			//check for each element in original_fd_lhs[i], if it is present in candidate_keys[j]
			sum = 0;
			for(var k=0; k<original_fd_lhs[i].length; k++)
			{
				var l=0;
				for(l=0; l<candidate_keys[j].length; l++)
				{
					if(original_fd_lhs[i][k] == candidate_keys[j][l])
					{
						sum++;
						break;
					}
				}
			}
			if(sum == original_fd_lhs[i].length)
			{
				lhs_in_candidate_key = true;
				break;
			}
		}
		//If LHS is not proper subset of any candidate key, 2nf property doesn't violate, we're safe
		if(lhs_in_candidate_key == false)
			continue;

		//Check if all attributes in original_fd_rhs[i] are key attributes
		var rhs_are_key = true;
		for(var j=0; j<original_fd_rhs[i].length; j++)
		{
			var k;
			for(k=0; k<candidate_keys.length; k++)
			{
				var l;
				for(l=0; l<candidate_keys[k].length; l++)
				{
					if(candidate_keys[k][l] == original_fd_rhs[i][j])
						break;
				}
				if(l != candidate_keys[k].length)
					break;
			}
			if(k == candidate_keys.length)
			{
				rhs_are_key = false;
				break;
			}
		}
		//Now, lhs is not superkey and some rhs attributes are not key attributes, hence table is not in 2nf
		if(rhs_are_key == false)
		{
			in_2nf = false;
			break;
		}
	}
	// console.log("in_2nf = "+in_2nf);

	if(in_2nf == false)
	{
		in_3nf = in_bcnf = false;
		return;
	}

	//Check for 3Nf
	//For each FD, either LHS is a superkey or all attributes in RHS should be key attributes
	for(var i=0; i<original_fd_lhs.length; i++)
	{
		var lhs_is_superkey = false;
		//Check if lhs_is_superkey: 	for each candidate key, check if it is subset of original_fd_lhs[i]
		for(var j=0; j<candidate_keys.length; j++)
		{
			if(candidate_keys[j].length > original_fd_lhs[i].length)
				continue;

			var sum = 0;
			for(var k=0; k<candidate_keys[j].length; k++)
			{
				for(var l=0; l<original_fd_lhs[i].length; l++)
				{
					if(original_fd_lhs[i][l] == candidate_keys[j][k])
					{
						sum++;
						break;
					}
				}
			}
			if(sum == candidate_keys[j].length)
			{
				lhs_is_superkey = true;
				break;
			}
		}
		// is lhs is superkey, we are safe
		if(lhs_is_superkey)
			continue;

		//Check if all attributes in original_fd_rhs[i] are key attributes
		var rhs_are_key = true;
		for(var j=0; j<original_fd_rhs[i].length; j++)
		{
			var k;
			for(k=0; k<candidate_keys.length; k++)
			{
				var l;
				for(l=0; l<candidate_keys[k].length; l++)
				{
					if(candidate_keys[k][l] == original_fd_rhs[i][j])
						break;
				}
				if(l != candidate_keys[k].length)
					break;
			}
			if(k == candidate_keys.length)
			{
				rhs_are_key = false;
				break;
			}
		}
		//Now, lhs is not superkey and some rhs attributes are not key attributes, hence table is not in 3nf
		if(rhs_are_key == false)
		{
			in_3nf = false;
			break;
		}
	}
	// console.log("in_3nf = "+in_3nf);
	if(in_3nf==false)
	{
		in_bcnf = false;
		return;
	}

	//Check for BCNF
	//A table is in BCNF if and only if for every non-trivial FD, the LHS is a superkey. 
	for(var i=0; i<original_fd_lhs.length; i++)
	{
		var lhs_is_superkey = false;
		//Check if lhs_is_superkey: 	for each candidate key, check if it is subset of original_fd_lhs[i]
		for(var j=0; j<candidate_keys.length; j++)
		{
			if(candidate_keys[j].length > original_fd_lhs[i].length)
				continue;

			var sum = 0;
			for(var k=0; k<candidate_keys[j].length; k++)
			{
				for(var l=0; l<original_fd_lhs[i].length; l++)
				{
					if(original_fd_lhs[i][l] == candidate_keys[j][k])
					{
						sum++;
						break;
					}
				}
			}
			if(sum == candidate_keys[j].length)
			{
				lhs_is_superkey = true;
				break;
			}
		}
		if(lhs_is_superkey == false)
		{
			in_bcnf = false;
			break;
		}
	}
	// console.log("in_bcnf = "+in_bcnf);

}

function main_check_normal_form()
{
	if(check_normal_form_num % 2 == 0)
	{
		find_normal_form();
		print_normal_form();
	}
	else
	{
		document.getElementById("check_normal_form_field").innerHTML = "";
	}
	check_normal_form_num++;
}

function print_normal_form()
{
	var field = "<fieldset>";

	field += "<span class=\"normal_form\">2NF </span>";
	if(in_2nf)
		field += "<img src=\"yes.png\" alt=\"YES\">";
	else field += "<img src=\"no.png\" alt=\"NO\">";
	field += "<br>";

	field += "<span class=\"normal_form\">3NF </span>";
	if(in_3nf)
		field += "<img src=\"yes.png\" alt=\"YES\">";
	else field += "<img src=\"no.png\" alt=\"NO\">";
	field+="<br>";

	field += "<span class=\"normal_form\">BCNF</span>";
	if(in_bcnf)
		field += "<img src=\"yes.png\" alt=\"YES\">";
	else field += "<img src=\"no.png\" alt=\"NO\">";


	field += "</fieldset><br>";
	document.getElementById("check_normal_form_field").innerHTML = field;
}


function main_normalize_to_3nf()
{
	if(normalize_to_3nf_num % 2 == 0)
	{
		find_minimal_cover();
		var temp_lhs = new Array();
		for(var i=0; i<fd_lhs.length; i++)
		{
			temp_lhs.push(fd_lhs[i].slice());
			temp_lhs[i].sort();
		}
		var temp_rhs = new Array();
		for(var i=0; i<fd_rhs.length; i++)
		{
			temp_rhs.push(fd_rhs[i].slice());
			temp_rhs[i].sort();
		}

		console.log("temp_lhs");
		for(var i=0; i<temp_lhs.length; i++)
		{
			console.log("i = "+i);
			for(var j=0; j<temp_lhs[i].length; j++)
				console.log(temp_lhs[i][j]);
		}
		console.log("temp_rhs");
		for(var i=0; i<temp_rhs.length; i++)
		{
			console.log("i = "+i);
			for(var j=0; j<temp_rhs[i].length; j++)
				console.log(temp_rhs[i][j]);
		}


		//Merge two FDs if lhs is same
		for(var i=0; i<temp_lhs.length; i++)
		{
			for(var j=i+1; j<temp_lhs.length; j++)
			{
				if(temp_lhs[i].length != temp_lhs[j].length)
					continue;
				var k=0;
				for(k=0; k<temp_lhs[i].length; k++)
				{
					if(temp_lhs[i][k] != temp_lhs[j][k])
						break;
				}
				if(k == temp_lhs[i].length)
				{
					console.log("i = "+i+"  j = "+j);
					for(var k=0; k<temp_rhs[j].length; k++)
					{
						console.log("ding    "+temp_rhs[j][k]);
						temp_rhs[i].push(temp_rhs[j][k]);
					}
					temp_lhs.splice(j, 1);
					temp_rhs.splice(j, 1);
					j--;
				}
			}
			if(temp_lhs[i].length==0 || temp_rhs[i].length==0)
			{
				temp_lhs.splice(i, 1);
				temp_rhs.splice(i, 1);
			}
		}


		var field = "<fieldset>";
		for(var i=0; i<temp_lhs.length; i++)
		{
			field += "<br><h1>Relation "+(i+1)+"</h1><br>";
			field += "<span>Attributes : &nbsp;&nbsp;&nbsp;</span>";
			for(var j=0; j<temp_lhs[i].length; j++)
				field += temp_lhs[i][j]+" ";
			for(var j=0; j<temp_rhs[i].length; j++)
				field += temp_rhs[i][j]+" ";
			field += "<br>";
			field += "<span>Candidate Key :  </span>";
			for(var j=0; j<temp_lhs[i].length; j++)
				field += temp_lhs[i][j]+" ";
			field += "<br><br>";
		}
		field += "</fieldset><br>";
		document.getElementById("normalize_to_3nf_field").innerHTML = field;
	}
	else
	{
		document.getElementById("normalize_to_3nf_field").innerHTML = "";
	}
	normalize_to_3nf_num++;
}